import { World } from "./World";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import * as THREE from 'three';
import { ThirdPersonCamera } from "./ThirdPersonCamera";

import { Driving } from '../characters/character_states/vehicles/Driving';
import { ICharacterState } from '../interfaces/ICharacterState';



declare interface XRRigidTransform {
    readonly position: DOMPointReadOnly;
    readonly orientation: DOMPointReadOnly;
    readonly matrix: Float32Array;
  }

export class WorldVR extends World{

    public isfirstTime: boolean = true;
    public lastSavedCharacterState: ICharacterState;

    constructor(worldScenePath?: any) {
        super(worldScenePath);
        this.initVR();
    }

    private initVR(): void {
        console.log("Mundo VR creado!");
        document.body.appendChild( VRButton.createButton( this.renderer ) );
        this.renderer.xr.enabled = true;
        this.renderer.xr.setReferenceSpaceType( 'local' );
        // this.renderer.xr.cameraAutoUpdate = false;
        const intervalId = setInterval(()=>{
            if(super.getCharacters()[0]) {
                console.log("encontrado!");
                console.log(super.getCharacters()[0]);
                const camera = super.getCamera();
                const character = super.getCharacters()[0];
                character.add(camera);
                clearInterval(intervalId);
            }

        },500);

    }

    // @Override
	public render(world: World): void
	{
		this.requestDelta = this.clock.getDelta();

        // Para VR no se utiliza este
		// requestAnimationFrame(() =>
		// {
		// 	world.render(world);
		// });
        // Para VR se utiliza este
        this.renderer.setAnimationLoop( function () {
            world.render( world );
        } );

		// Getting timeStep
		let unscaledTimeStep = (this.requestDelta + this.renderDelta + this.logicDelta) ;
		let timeStep = unscaledTimeStep * this.params.Time_Scale;
		timeStep = Math.min(timeStep, 1 / 30);    // min 30 fps

		// Logic
		world.update(timeStep, unscaledTimeStep);

        // Update vr
        if(this.characters.length != 0) {
            const renderer = this.renderer;
            const camera = this.camera;
            const character = this.characters[0];
            const baseReferenceSpace = renderer.xr.getReferenceSpace();
            if(renderer.xr.isPresenting){
                // this.camera.rotateOnWorldAxis(new THREE.Vector3(1,1,1), 1);
                // this.camera.rotateY(2);
                // character.rotateY(3.14)
                // if( !(character.charState instanceof Driving) ) {
                //     character.rotateY(3.14)
                // } else {

                // }
                // console.log(character.rotation)
                // console.log(camera.rotation);
                if( !(character.charState instanceof Driving) ) {
                    character.rotateY(3.14)
                } else {
                    if(this.isfirstTime) {
                        character.rotation.set(character.rotation.x,character.rotation.y + 3.14,character.rotation.z);
                        this.lastSavedCharacterState = character.charState;
                        this.isfirstTime = false;
                    } else {
                        if( character.charState.name !== this.lastSavedCharacterState.name ) {
                            this.isfirstTime = true;
                        }
                    }
                }

                // Utilizar botones oculus para manejar al jugador y los vehiculos (mapear los controles del mando en las teclas del ordenador, al igual que hago con la ui para mobile)
                // https://discourse.threejs.org/t/oculus-quest-2-y-x-b-a-menu-touch-input-data-from-buttons/21905
                //https://github.com/gkjohnson/threejs-sandbox
                
                // this.camera.updateMatrix();
                // this.camera.updateMatrixWorld()
                // this.camera.updateWorldMatrix(false,false);
                // console.log(this.camera.quaternion)
                // this.camera.rotation.set(0,this.requestDelta,0);
                // const camera = this.camera;
                // this.characters[0].children[1].rotation.y = -this.characters[0].children[1].rotation.y
                
                // camera.rotation.set(camera.rotation.x, -camera.rotation.y, camera.rotation.z);
                // .getWorldQuaternion 
                // .setRotationFromQuaternion ( q : Quaternion ) 
                // const quaternion = character.getWorldQuaternion(new THREE.Quaternion());
                // camera.setRotationFromQuaternion(quaternion);

                // this.camera.matrix=(this.characters[0].matrix)

                // this.camera.quaternion.set(character.quaternion.x,character.quaternion.y,character.quaternion.z, character.quaternion.w);
                // this.camera.position.set(character.position.x,character.position.y,character.position.z);
                // this.camera.updateMatrix();
                // console.log(this.camera.position);
                // const cameras = renderer.xr.getCamera(this.camera);
                // cameras.position.set(character.position.x,character.position.y,character.position.z);
                // cameras.updateMatrix();
                // console.log(cameras.position);
                // console.log(character.position);
            }
            // const offsetPosition = { x: - character.position.x, y: - character.position.y, z: - character.position.z, w: 1 };
            // const offsetRotation = new THREE.Quaternion();
            // const transform = new XRRigidTransform( offsetPosition, offsetRotation );
            // const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace( transform );
            // renderer.xr.setReferenceSpace( teleportSpaceOffset );

        }

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
        // console.log(this.camera.position);

		// Measuring render time
		this.renderDelta = this.clock.getDelta();
        
	}



}

