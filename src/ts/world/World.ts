import * as THREE from 'three';
import * as CANNON from 'cannon';
import Swal from 'sweetalert2';
import * as $ from 'jquery';

import { CameraOperator } from '../core/CameraOperator';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

import { Detector } from '../../lib/utils/Detector';
import { Stats } from '../../lib/utils/Stats';
import * as GUI from '../../lib/utils/dat.gui';
import { CannonDebugRenderer } from '../../lib/cannon/CannonDebugRenderer';
import * as _ from 'lodash';

import { InputManager } from '../core/InputManager';
import * as Utils from '../core/FunctionLibrary';
import { LoadingManager } from '../core/LoadingManager';
import { InfoStack } from '../core/InfoStack';
import { UIManager } from '../core/UIManager';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { IUpdatable } from '../interfaces/IUpdatable';
import { Character } from '../characters/Character';
import { Path } from './Path';
import { CollisionGroups } from '../enums/CollisionGroups';
import { BoxCollider } from '../physics/colliders/BoxCollider';
import { TrimeshCollider } from '../physics/colliders/TrimeshCollider';
import { Vehicle } from '../vehicles/Vehicle';
import { Scenario } from './Scenario';
import { Sky } from './Sky';
import { Ocean } from './Ocean';

// import { CreateScenario } from '../../drei-espinaco/CreateScenario';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { create as createManagerNipple } from 'nipplejs';
import { ThirdPersonCamera } from './ThirdPersonCamera';

//TODO: Carrera con escenario catedral, se cambia texturas por texturavideo de cancion naugthy swain a elena con efectos rosa shader
/** TAREAS POR HACER
 * Hacer web scrapping en un servidor nodejs con puppetee aparte y mediante peticiones realizar compra y ver productos en un supermercado
 * Mostrar UI para comenzar carrera (ya estaba escrito por el autor original)
 * Crear escenario catedral con sus physics collider y el path finder para carreras de IA
 * Importar escenario en proyecto threejs y comprobar que todo funcione
 * Crear UI para comienzo de la aplicación y opciones: comenzar carrera, modo libre. (El modo libre quita la pantalla y empieza el juego tal y como está ahora por defecto y comenzar carrera simula como si se hubiese pulsado la opción de empezar carrera de la manera en la que estaba originalmente el proyecto)
 * Crear carrera con catedral y carrera con naughty swain
 * Crear Interfaz visual UI para pulsar los botones con el movil
 * Que se pueda jugar a la gba dentro del juego
 */
export class World {
	public renderer: THREE.WebGLRenderer;
	public camera: THREE.PerspectiveCamera;
	public composer: any;
	public stats: Stats;
	public graphicsWorld: THREE.Scene;
	public sky: Sky;
	public physicsWorld: CANNON.World;
	public parallelPairs: any[];
	public physicsFrameRate: number;
	public physicsFrameTime: number;
	public physicsMaxPrediction: number;
	public clock: THREE.Clock;
	public renderDelta: number;
	public logicDelta: number;
	public requestDelta: number;
	public sinceLastFrame: number;
	public justRendered: boolean;
	public params: any;
	public inputManager: InputManager;
	public cameraOperator: CameraOperator;
	public timeScaleTarget: number = 1;
	public console: InfoStack;
	public cannonDebugRenderer: CannonDebugRenderer;
	public scenarios: Scenario[] = [];
	public characters: Character[] = [];
	public vehicles: Vehicle[] = [];
	public paths: Path[] = [];
	public scenarioGUIFolder: any;
	public updatables: IUpdatable[] = [];

	private lastScenarioID: string;

	constructor(worldScenePath?: any) {
		const scope = this;

		// WebGL not supported
		if (!Detector.webgl) {
			Swal.fire({
				icon: 'warning',
				title: 'WebGL compatibility',
				text: 'This browser doesn\'t seem to have the required WebGL capabilities. The application may not work correctly.',
				footer: '<a href="https://get.webgl.org/" target="_blank">Click here for more information</a>',
				showConfirmButton: false,
				buttonsStyling: false
			});
		}

		// Renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.generateHTML();
		this.createNipple();
		this.createButtons();

		// Auto window resize
		function onWindowResize(): void {
			scope.camera.aspect = window.innerWidth / window.innerHeight;
			scope.camera.updateProjectionMatrix();
			scope.renderer.setSize(window.innerWidth, window.innerHeight);
			fxaaPass.uniforms['resolution'].value.set(1 / (window.innerWidth * pixelRatio), 1 / (window.innerHeight * pixelRatio));
			// scope.composer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
		}
		window.addEventListener('resize', onWindowResize, false);

		// Three.js scene
		this.graphicsWorld = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1010);

		// @ts-ignore
		window.scene = this.graphicsWorld;

		// Passes
		let renderPass = new RenderPass(this.graphicsWorld, this.camera);
		let fxaaPass = new ShaderPass(FXAAShader);

		// FXAA
		let pixelRatio = this.renderer.getPixelRatio();
		fxaaPass.material['uniforms'].resolution.value.x = 1 / (window.innerWidth * pixelRatio);
		fxaaPass.material['uniforms'].resolution.value.y = 1 / (window.innerHeight * pixelRatio);

		// Composer
		// this.composer = new EffectComposer( this.renderer );
		// this.composer.addPass( renderPass );
		// this.composer.addPass( fxaaPass );

		// Physics
		this.physicsWorld = new CANNON.World();
		this.physicsWorld.gravity.set(0, -9.81, 0);
		this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
		this.physicsWorld.solver.iterations = 10;
		this.physicsWorld.allowSleep = true;

		this.parallelPairs = [];
		this.physicsFrameRate = 60;
		this.physicsFrameTime = 1 / this.physicsFrameRate;
		this.physicsMaxPrediction = this.physicsFrameRate;

		// RenderLoop
		this.clock = new THREE.Clock();
		this.renderDelta = 0;
		this.logicDelta = 0;
		this.sinceLastFrame = 0;
		this.justRendered = false;

		// Stats (FPS, Frame time, Memory)
		this.stats = Stats();
		// Create right panel GUI
		this.createParamsGUI(scope);

		// Initialization
		this.inputManager = new InputManager(this, this.renderer.domElement);
		this.cameraOperator = new CameraOperator(this, this.camera, this.params.Mouse_Sensitivity);
		// this.sky = new Sky(this);


		// Load scene if path is supplied
		if (worldScenePath !== undefined) {
			let loadingManager = new LoadingManager(this);
			loadingManager.onFinishedCallback = () => {
				this.update(1, 1);
				this.setTimeScale(1);

				// Swal.fire({
				// 	title: 'Welcome to Sketchbook!',
				// 	text: 'Feel free to explore the world and interact with available vehicles. There are also various scenarios ready to launch from the right panel.',
				// 	footer: '<a href="https://github.com/swift502/Sketchbook" target="_blank">GitHub page</a><a href="https://discord.gg/fGuEqCe" target="_blank">Discord server</a>',
				// 	confirmButtonText: 'Okay',
				// 	buttonsStyling: false,
				// 	onClose: () => {
				// 		UIManager.setUserInterfaceVisible(true);
				// 	}
				// });
				// UIManager.setUserInterfaceVisible(true);
			};
			loadingManager.loadGLTF(worldScenePath, (gltf) => {
				this.loadScene(loadingManager, gltf);
			}
			);
		}
		else {
			// UIManager.setUserInterfaceVisible(true);
			UIManager.setLoadingScreenVisible(false);
			// Swal.fire({
			// 	icon: 'success',
			// 	title: 'Hello world!',
			// 	text: 'Empty Sketchbook world was succesfully initialized. Enjoy the blueness of the sky.',
			// 	buttonsStyling: false
			// });
		}

		this.render(this);
	}

	// Update
	// Handles all logic updates.
	public update(timeStep: number, unscaledTimeStep: number): void {
		this.updatePhysics(timeStep);

		// Update registred objects
		this.updatables.forEach((entity) => {
			entity.update(timeStep, unscaledTimeStep);
		});

		// Lerp time scale
		this.params.Time_Scale = THREE.MathUtils.lerp(this.params.Time_Scale, this.timeScaleTarget, 0.2);

		// Physics debug
		if (this.params.Debug_Physics) this.cannonDebugRenderer.update();

		//espisepi: add thirdpersonCamera to Character
		if (this.cameraOperator.followMode === false) {
			this.cameraOperator.followMode = true;
		}
		// if(!this.thirdPersonCamera && this.cameraOperator){
		// 	this.thirdPersonCamera = new ThirdPersonCamera(this.cameraOperator);
		// }
		// if(this.thirdPersonCamera){
		// 	this.thirdPersonCamera.Update(timeStep,0);
		// }
		// FIN espisepi: add thirdpersonCamera to Character
	}

	public updatePhysics(timeStep: number): void {
		// Step the physics world
		this.physicsWorld.step(this.physicsFrameTime, timeStep);

		// this.characters.forEach((char) => {
		// 	if (this.isOutOfBounds(char.characterCapsule.body.position))
		// 	{
		// 		this.outOfBoundsRespawn(char.characterCapsule.body);
		// 	}
		// });

		// this.vehicles.forEach((vehicle) => {
		// 	if (this.isOutOfBounds(vehicle.rayCastVehicle.chassisBody.position))
		// 	{
		// 		let worldPos = new THREE.Vector3();
		// 		vehicle.spawnPoint.getWorldPosition(worldPos);
		// 		worldPos.y += 1;
		// 		this.outOfBoundsRespawn(vehicle.rayCastVehicle.chassisBody, Utils.cannonVector(worldPos));
		// 	}
		// });
	}

	public isOutOfBounds(position: CANNON.Vec3): boolean {
		let inside = position.x > -211.882 && position.x < 211.882 &&
			position.z > -169.098 && position.z < 153.232 &&
			position.y > 0.107;
		let belowSeaLevel = position.y < 14.989;

		return !inside && belowSeaLevel;
	}

	public outOfBoundsRespawn(body: CANNON.Body, position?: CANNON.Vec3): void {
		let newPos = position || new CANNON.Vec3(0, 16, 0);
		let newQuat = new CANNON.Quaternion(0, 0, 0, 1);

		body.position.copy(newPos);
		body.interpolatedPosition.copy(newPos);
		body.quaternion.copy(newQuat);
		body.interpolatedQuaternion.copy(newQuat);
		body.velocity.setZero();
		body.angularVelocity.setZero();
	}

	/**
	 * Rendering loop.
	 * Implements fps limiter and frame-skipping
	 * Calls world's "update" function before rendering.
	 * @param {World} world 
	 */
	public render(world: World): void {
		this.requestDelta = this.clock.getDelta();

		requestAnimationFrame(() => {
			world.render(world);
		});

		// Getting timeStep
		let unscaledTimeStep = (this.requestDelta + this.renderDelta + this.logicDelta);
		let timeStep = unscaledTimeStep * this.params.Time_Scale;
		timeStep = Math.min(timeStep, 1 / 30);    // min 30 fps

		// Logic
		world.update(timeStep, unscaledTimeStep);

		// Measuring logic time
		this.logicDelta = this.clock.getDelta();

		// Frame limiting
		let interval = 1 / 60;
		this.sinceLastFrame += this.requestDelta + this.renderDelta + this.logicDelta;
		this.sinceLastFrame %= interval;

		// Stats end
		this.stats.end();
		this.stats.begin();

		// Actual rendering with a FXAA ON/OFF switch
		// if (this.params.FXAA) this.composer.render();
		// else this.renderer.render(this.graphicsWorld, this.camera);
		this.renderer.render(this.graphicsWorld, this.camera);

		// Measuring render time
		this.renderDelta = this.clock.getDelta();
	}

	public setTimeScale(value: number): void {
		this.params.Time_Scale = value;
		this.timeScaleTarget = value;
	}

	public add(worldEntity: IWorldEntity): void {
		worldEntity.addToWorld(this);
		this.registerUpdatable(worldEntity);
	}

	public registerUpdatable(registree: IUpdatable): void {
		this.updatables.push(registree);
		this.updatables.sort((a, b) => (a.updateOrder > b.updateOrder) ? 1 : -1);
	}

	public remove(worldEntity: IWorldEntity): void {
		worldEntity.removeFromWorld(this);
		this.unregisterUpdatable(worldEntity);
	}

	public unregisterUpdatable(registree: IUpdatable): void {
		_.pull(this.updatables, registree);
	}

	public loadScene(loadingManager: LoadingManager, gltf: any): void {
		/* espisepi code */
		// const createWorld = new CreateScenario(this);
		// Create plane mesh physics
		// const mesh = new THREE.Mesh(
		//     new THREE.BoxBufferGeometry(1,1,1),
		//     new THREE.MeshBasicMaterial({color:'red', wireframe:true})
		// );
		// mesh.position.set(0,0,0);
		// mesh.scale.set(5000,1,5000);
		// mesh.updateMatrix();
		// this.graphicsWorld.add(mesh);
		// const phys = new BoxCollider({size: new THREE.Vector3(mesh.scale.x, mesh.scale.y, mesh.scale.z)});
		// phys.body.position.copy(Utils.cannonVector(mesh.position));
		// phys.body.quaternion.copy(Utils.cannonQuat(mesh.quaternion));
		// phys.body.computeAABB();
		// phys.body.shapes.forEach((shape) => {
		// 	shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
		// });
		// this.physicsWorld.addBody(phys.body);

		const ambientLight = new THREE.AmbientLight();
		this.graphicsWorld.add(ambientLight);

		const loader = new GLTFLoader();
		// loader.load('build/assets/pla.glb',(gltf)=>{
		// 	const scene = gltf.scene;
		// 	scene.scale.set(1,1,1);
		// 	scene.position.set(0,0,0);
		// 	this.graphicsWorld.add(scene);
		// 	console.log(scene);
		// });
		// const loader = new GLTFLoader();
		// loader.load('build/assets/catedral.glb',(gltf)=>{
		// 	const scene = gltf.scene;
		// 	scene.scale.set(1,1,1);
		// 	scene.position.set(0,-32.0,0);
		// 	this.graphicsWorld.add(scene);
		// 	console.log(scene);
		// });
		// loader.load('build/assets/parqueflores.glb',(gltf)=>{
		// 	const scene = gltf.scene;
		// 	scene.scale.set(1,1,1);
		// 	scene.position.set(0,-0.5,0);
		// 	this.graphicsWorld.add(scene);
		// 	console.log(scene);
		// });
		// loader.load('build/assets/jaguar.glb',(gltf)=>{
		// 	const scene = gltf.scene;
		// 	scene.scale.set(1,1,1);
		// 	scene.position.set(50,-0.5,-100);
		// 	this.graphicsWorld.add(scene);
		// 	console.log(scene);
		// });

		gltf.scene.traverse((child) => {
			if (child.hasOwnProperty('userData')) {
				// if (child.type === 'Mesh')
				// {
				// 	Utils.setupMeshProperties(child);
				// 	this.sky.csm.setupMaterial(child.material);

				// 	if (child.material.name === 'ocean')
				// 	{
				// 		this.registerUpdatable(new Ocean(child, this));
				// 	}
				// }

		

				if (child.userData.hasOwnProperty('data')) {
					if (child.userData.data === 'physics') {
						if (child.userData.hasOwnProperty('type')) {
							// Convex doesn't work! Stick to boxes!
							let phys;
							if (child.userData.type === 'box') {
								phys = new BoxCollider({ size: new THREE.Vector3(child.scale.x, child.scale.y, child.scale.z) });
								phys.body.position.copy(Utils.cannonVector(child.position));
								phys.body.quaternion.copy(Utils.cannonQuat(child.quaternion));
								phys.body.computeAABB();

								phys.body.shapes.forEach((shape) => {
									shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
								});

								this.physicsWorld.addBody(phys.body);
							}
							else if (child.userData.type === 'trimesh') {
								// Invertir normals
								// const sininvertir = child.geometry.attributes.normal.array;
								// console.log(sininvertir);
								// const invertedNormals = child.geometry.attributes.normal.array.map(v => (-1) * v);
								// console.log(invertedNormals)
								// child.geometry.attributes.normal.array = invertedNormals;

								phys = new TrimeshCollider(child, {});
								this.physicsWorld.addBody(phys.body);
								
								// this.graphicsWorld.add(phys.mesh);

							}

							child.visible = true;
						}
					}

					if (child.userData.data === 'path') {
						this.paths.push(new Path(child));
					}

					if (child.userData.data === 'scenario') {
						this.scenarios.push(new Scenario(child, this));
					}
				}
			}
		});

		gltf.scene.visible = true;
		this.graphicsWorld.add(gltf.scene);

		// Launch default scenario
		let defaultScenarioID: string;
		for (const scenario of this.scenarios) {
			if (scenario.default) {
				defaultScenarioID = scenario.id;
				break;
			}
		}
		if (defaultScenarioID !== undefined) this.launchScenario(defaultScenarioID, loadingManager);
	}

	public launchScenario(scenarioID: string, loadingManager?: LoadingManager): void {
		this.lastScenarioID = scenarioID;

		this.clearEntities();

		// Launch default scenario
		if (!loadingManager) loadingManager = new LoadingManager(this);
		for (const scenario of this.scenarios) {
			if (scenario.id === scenarioID || scenario.spawnAlways) {
				scenario.launch(loadingManager, this);
			}
		}
	}

	public restartScenario(): void {
		if (this.lastScenarioID !== undefined) {
			document.exitPointerLock();
			this.launchScenario(this.lastScenarioID);
		}
		else {
			console.warn('Can\'t restart scenario. Last scenarioID is undefined.');
		}
	}

	public clearEntities(): void {
		for (let i = 0; i < this.characters.length; i++) {
			this.remove(this.characters[i]);
			i--;
		}

		for (let i = 0; i < this.vehicles.length; i++) {
			this.remove(this.vehicles[i]);
			i--;
		}
	}

	public scrollTheTimeScale(scrollAmount: number): void {
		// Changing time scale with scroll wheel
		const timeScaleBottomLimit = 0.003;
		const timeScaleChangeSpeed = 1.3;

		if (scrollAmount > 0) {
			this.timeScaleTarget /= timeScaleChangeSpeed;
			if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = 0;
		}
		else {
			this.timeScaleTarget *= timeScaleChangeSpeed;
			if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = timeScaleBottomLimit;
			this.timeScaleTarget = Math.min(this.timeScaleTarget, 1);
		}
	}

	public updateControls(controls: any): void {
		let html = '';
		html += '<h2 class="controls-title">Controls:</h2>';

		controls.forEach((row) => {
			html += '<div class="ctrl-row">';
			row.keys.forEach((key) => {
				if (key === '+' || key === 'and' || key === 'or' || key === '&') html += '&nbsp;' + key + '&nbsp;';
				else html += '<span class="ctrl-key">' + key + '</span>';
			});

			html += '<span class="ctrl-desc">' + row.desc + '</span></div>';
		});

		document.getElementById('controls').innerHTML = html;
	}

	private createButtons(): void {
		this.createCarButtons();
	}

	private createCarButtons(): void {
		// TODO: HECHO!
		// Display car buttons visible
		// getElementById(html element button)
		// attach html button element to js event functionality

		// document.addEventListener('keydown', (event)=> {    
		// 	console.log(event); // all event related info
		// 	console.log(event.type);
		// 	console.log(event.key);
		// 	console.log(event.code);
		// });


		const backgroundColor = "rgb(63, 63, 63)";
		const backgroundColorHover = "rgb(147, 147, 147)";

		const leftArrow = document.getElementById("left-arrow");
		leftArrow.addEventListener("pointerdown", (evt) => {
			evt.preventDefault();
			leftArrow.style.backgroundColor = backgroundColorHover;
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' }));
		});
		leftArrow.addEventListener("pointerup", (evt) => {
			evt.preventDefault();
			leftArrow.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', code: 'KeyA' }));
		});
		leftArrow.addEventListener('pointerout', (evt) => {
			evt.preventDefault();
			leftArrow.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', code: 'KeyA' }));
		});

		const rightArrow = document.getElementById("right-arrow");
		rightArrow.addEventListener("pointerdown", (evt) => {
			evt.preventDefault();
			rightArrow.style.backgroundColor = backgroundColorHover;
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', code: 'KeyD' }));
		});
		rightArrow.addEventListener("pointerup", (evt) => {
			evt.preventDefault();
			rightArrow.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', code: 'KeyD' }));
		});
		rightArrow.addEventListener('pointerout', (evt) => {
			evt.preventDefault();
			rightArrow.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', code: 'KeyD' }));
		});

		const upArrow = document.getElementById("up-arrow");
		upArrow.addEventListener("pointerdown", (evt) => {
			evt.preventDefault();
			upArrow.style.backgroundColor = backgroundColorHover;
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', code: 'KeyW' }));
		});
		upArrow.addEventListener("pointerup", (evt) => {
			evt.preventDefault();
			upArrow.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'w', code: 'KeyW' }));
		});
		upArrow.addEventListener('pointerout', (evt) => {
			evt.preventDefault();
			upArrow.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'w', code: 'KeyW' }));
		});


		const downArrow = document.getElementById("down-arrow");
		downArrow.addEventListener("pointerdown", (evt) => {
			evt.preventDefault();
			downArrow.style.backgroundColor = backgroundColorHover;
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', code: 'KeyS' }));
		});
		downArrow.addEventListener("pointerup", (evt) => {
			evt.preventDefault();
			downArrow.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 's', code: 'KeyS' }));
		});
		downArrow.addEventListener('pointerout', (evt) => {
			evt.preventDefault();
			downArrow.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 's', code: 'KeyS' }));
		});

		const handBrake = document.getElementById("hand-brake");
		handBrake.addEventListener("pointerdown", (evt) => {
			evt.preventDefault();
			handBrake.style.backgroundColor = backgroundColorHover;
			document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }));
		});
		handBrake.addEventListener("pointerup", (evt) => {
			evt.preventDefault();
			handBrake.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space' }));
		});
		handBrake.addEventListener("pointerout", (evt) => {
			evt.preventDefault();
			handBrake.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space' }));
		});

		const enterVehicle = document.getElementById("enter-vehicle");
		enterVehicle.addEventListener("pointerdown", (evt) => {
			evt.preventDefault();
			enterVehicle.style.backgroundColor = backgroundColorHover;
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', code: 'KeyF' }));
		});
		enterVehicle.addEventListener("pointerup", (evt) => {
			evt.preventDefault();
			enterVehicle.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'f', code: 'KeyF' }));
		});
		enterVehicle.addEventListener("pointerout", (evt) => {
			evt.preventDefault();
			enterVehicle.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'f', code: 'KeyF' }));
		});

		const magnifyingGlass = document.getElementById("magnifying-glass");
		magnifyingGlass.addEventListener("pointerdown", (evt) => {
			evt.preventDefault();
			magnifyingGlass.style.backgroundColor = backgroundColorHover;
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', code: 'KeyV' }));
		});
		magnifyingGlass.addEventListener("pointerup", (evt) => {
			evt.preventDefault();
			magnifyingGlass.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'v', code: 'KeyV' }));
		});
		magnifyingGlass.addEventListener("pointerout", (evt) => {
			evt.preventDefault();
			magnifyingGlass.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'v', code: 'KeyV' }));
		});

		const leftPlane = document.getElementById("left-plane");
		leftPlane.addEventListener("pointerdown", (evt) => {
			evt.preventDefault();
			leftPlane.style.backgroundColor = backgroundColorHover;
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', code: 'KeyQ' }));
		});
		leftPlane.addEventListener("pointerup", (evt) => {
			evt.preventDefault();
			leftPlane.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'q', code: 'KeyQ' }));
		});
		leftPlane.addEventListener("pointerout", (evt) => {
			evt.preventDefault();
			leftPlane.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'q', code: 'KeyQ' }));
		});

		const rightPlane = document.getElementById("right-plane");
		rightPlane.addEventListener("pointerdown", (evt) => {
			evt.preventDefault();
			rightPlane.style.backgroundColor = backgroundColorHover;
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', code: 'KeyE' }));
		});
		rightPlane.addEventListener("pointerup", (evt) => {
			evt.preventDefault();
			rightPlane.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'e', code: 'KeyE' }));
		});
		rightPlane.addEventListener("pointerout", (evt) => {
			evt.preventDefault();
			rightPlane.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'e', code: 'KeyE' }));
		});

		const enginePlane = document.getElementById("engine-plane");
		enginePlane.addEventListener("pointerdown", (evt) => {
			evt.preventDefault();
			enginePlane.style.backgroundColor = backgroundColorHover;
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft' }));
		});
		enginePlane.addEventListener("pointerup", (evt) => {
			evt.preventDefault();
			enginePlane.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft' }));
		});
		enginePlane.addEventListener("pointerout", (evt) => {
			evt.preventDefault();
			enginePlane.style.backgroundColor = backgroundColor;
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft' }));
		});


	}

	private createNipple(): void {
		const div = document.createElement('div');
		div.style.width = '100vw';
		div.style.height = '100vh';
		div.style.position = 'absolute';
		document.body.appendChild(div);
		// document.getElementById('canvas').style.position = 'absolute';
		this.renderer.domElement.style.position = 'absolute';
		const options = {
			zone: div,
			color: 'blue',
			multitouch: true
		};
		const joystick = createManagerNipple(options);
		this.bindNipple(joystick);
	}

	private bindNipple(joystick: any): void {

		const handleJoystick = (evt: any, data: any) => {
			this.handleJoystick(evt, data);
		}

		joystick.on('start end', function (evt, data) {
			handleJoystick(evt, data);
		}).on('move', function (evt, data) {
			handleJoystick(evt, data);
		}).on('dir:up plain:up dir:left plain:left dir:down ' +
			'plain:down dir:right plain:right',
			function (evt, data) {
				handleJoystick(evt, data);
			}
		).on('pressure', function (evt, data) {
			handleJoystick(evt, data);
		});
	}

	private handleJoystick(evt: any, data: any): void {
		if (data?.direction?.y === 'up' && (data?.angle?.degree >= 15.0 && data?.angle?.degree <= 165.0)) {
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', code: 'KeyW' }));
		} else {
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'w', code: 'KeyW' }));
		}
		if (data?.direction?.y === 'down' && (data?.angle?.degree >= 195.0 && data?.angle?.degree <= 345.0)) {
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', code: 'KeyS' }));
		} else {
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 's', code: 'KeyS' }));
		}
		if (data?.direction?.x === 'left' && (data?.angle?.degree >= 135.0 && data?.angle?.degree <= 225.0)) {
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' }));
		} else {
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', code: 'KeyA' }));
		}
		if (data?.direction?.x === 'right' && (data?.angle?.degree <= 45.0 || data?.angle?.degree >= 315.0)) {
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', code: 'KeyD' }));
		} else {
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', code: 'KeyD' }));
		}
		if (data?.force >= 1.0) {
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'shift', code: 'ShiftLeft' }));
		} else {
			document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift', code: 'ShiftLeft' }));
		}
	}

	private generateHTML(): void {
		// Fonts
		$('head').append('<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap" rel="stylesheet">');
		$('head').append('<link href="https://fonts.googleapis.com/css2?family=Solway:wght@400;500;700&display=swap" rel="stylesheet">');
		$('head').append('<link href="https://fonts.googleapis.com/css2?family=Cutive+Mono&display=swap" rel="stylesheet">');

		// Loader
		$(`	<div id="loading-screen">
				<div id="loading-screen-background"></div>
				<h1 id="main-title" class="sb-font">Sketchbook 0.4</h1>
				<div class="cubeWrap">
					<div class="cube">
						<div class="faces1"></div>
						<div class="faces2"></div>     
					</div> 
				</div> 
				<div id="loading-text">Loading...</div>
			</div>
		`).appendTo('body');

		// UI
		$(`	<div id="ui-container" style="display: none;">
				<div class="github-corner">
					<a href="https://github.com/swift502/Sketchbook" target="_blank" title="Fork me on GitHub">
						<svg viewbox="0 0 100 100" fill="currentColor">
							<title>Fork me on GitHub</title>
							<path d="M0 0v100h100V0H0zm60 70.2h.2c1 2.7.3 4.7 0 5.2 1.4 1.4 2 3 2 5.2 0 7.4-4.4 9-8.7 9.5.7.7 1.3 2
							1.3 3.7V99c0 .5 1.4 1 1.4 1H44s1.2-.5 1.2-1v-3.8c-3.5 1.4-5.2-.8-5.2-.8-1.5-2-3-2-3-2-2-.5-.2-1-.2-1
							2-.7 3.5.8 3.5.8 2 1.7 4 1 5 .3.2-1.2.7-2 1.2-2.4-4.3-.4-8.8-2-8.8-9.4 0-2 .7-4 2-5.2-.2-.5-1-2.5.2-5
							0 0 1.5-.6 5.2 1.8 1.5-.4 3.2-.6 4.8-.6 1.6 0 3.3.2 4.8.7 2.8-2 4.4-2 5-2z"></path>
						</svg>
					</a>
				</div>
				<div class="left-panel">
					<div id="controls" class="panel-segment flex-bottom"></div>
				</div>
			</div>
		`).appendTo('body');

		// Canvas
		document.body.appendChild(this.renderer.domElement);
		this.renderer.domElement.id = 'canvas';
	}

	private createParamsGUI(scope: World): void {
		this.params = {
			Pointer_Lock: true,
			Mouse_Sensitivity: 0.3,
			Time_Scale: 1,
			Shadows: true,
			FXAA: true,
			Debug_Physics: true,
			Debug_FPS: false,
			Sun_Elevation: 50,
			Sun_Rotation: 145,
		};

		if (this.params.Debug_Physics) {
			this.cannonDebugRenderer = new CannonDebugRenderer(this.graphicsWorld, this.physicsWorld);
		}

		const gui = new GUI.GUI();

		// Scenario
		this.scenarioGUIFolder = gui.addFolder('Scenarios');
		this.scenarioGUIFolder.open();

		// World
		let worldFolder = gui.addFolder('World');
		worldFolder.add(this.params, 'Time_Scale', 0, 1).listen()
			.onChange((value) => {
				scope.timeScaleTarget = value;
			});
		worldFolder.add(this.params, 'Sun_Elevation', 0, 180).listen()
			.onChange((value) => {
				scope.sky.phi = value;
			});
		worldFolder.add(this.params, 'Sun_Rotation', 0, 360).listen()
			.onChange((value) => {
				scope.sky.theta = value;
			});

		// Input
		let settingsFolder = gui.addFolder('Settings');
		settingsFolder.add(this.params, 'FXAA');
		settingsFolder.add(this.params, 'Shadows')
			.onChange((enabled) => {
				if (enabled) {
					// this.sky.csm.lights.forEach((light) => {
					// 	light.castShadow = true;
					// });
				}
				else {
					// this.sky.csm.lights.forEach((light) => {
					// 	light.castShadow = false;
					// });
				}
			});
		settingsFolder.add(this.params, 'Pointer_Lock')
			.onChange((enabled) => {
				scope.inputManager.setPointerLock(enabled);
			});
		settingsFolder.add(this.params, 'Mouse_Sensitivity', 0, 1)
			.onChange((value) => {
				scope.cameraOperator.setSensitivity(value, value * 0.8);
			});
		settingsFolder.add(this.params, 'Debug_Physics')
			.onChange((enabled) => {
				if (enabled) {
					this.cannonDebugRenderer = new CannonDebugRenderer(this.graphicsWorld, this.physicsWorld);
				}
				else {
					this.cannonDebugRenderer.clearMeshes();
					this.cannonDebugRenderer = undefined;
				}

				scope.characters.forEach((char) => {
					char.raycastBox.visible = enabled;
				});
			});
		settingsFolder.add(this.params, 'Debug_FPS')
			.onChange((enabled) => {
				UIManager.setFPSVisible(enabled);
			});

		gui.open();
	}
}