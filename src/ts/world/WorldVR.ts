import { World } from "./World";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import * as THREE from 'three';


declare interface XRRigidTransform {
    readonly position: DOMPointReadOnly;
    readonly orientation: DOMPointReadOnly;
    readonly matrix: Float32Array;
  }

export class WorldVR extends World{

    constructor(worldScenePath?: any) {
        super(worldScenePath);
        this.initVR();
        this.initControllers();
    }

    private initVR(): void {
        console.log("Mundo VR creado!");
        document.body.appendChild( VRButton.createButton( this.renderer ) );
        this.renderer.xr.enabled = true;
        this.renderer.xr.setReferenceSpaceType( 'local' );

    }

    private initControllers(): void {
        const controllerModelFactory = new XRControllerModelFactory();
        
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

        if(this.characters.length != 0) {
            const renderer = this.renderer;
            const character = this.characters[0];
            const baseReferenceSpace = renderer.xr.getReferenceSpace();
            if(renderer.xr.isPresenting){
                this.camera.position.set(character.position.x,character.position.y,character.position.z);
                this.camera.updateMatrix();
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

		// Getting timeStep
		let unscaledTimeStep = (this.requestDelta + this.renderDelta + this.logicDelta) ;
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
        // console.log(this.camera.position);

		// Measuring render time
		this.renderDelta = this.clock.getDelta();
	}



}

