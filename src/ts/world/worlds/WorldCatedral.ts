import { World } from "../World";
import * as THREE from 'three';


export class WorldCatedral extends World {

    constructor(worldScenePath?: any) {
        super(worldScenePath);
        this.loadVisuals();
    }

    //@Override
    public update(timeStep: number, unscaledTimeStep: number): void {
        super.update(timeStep, unscaledTimeStep);
        this.updateInternal();
    }

    private loadVisuals(): void {

        // const planeFloor = new THREE.Mesh(
        //     new THREE.PlaneBufferGeometry(500,500,250,250),
        //     new THREE.MeshBasicMaterial({
        //         wireframe: true,
        //         color: 'red'
        //     })
        // )
        // planeFloor.rotateX(3.14/2.0);
        // planeFloor.position.set(0,-10,0);
        // this.graphicsWorld.add(planeFloor);

        // const planeHigh = new THREE.Mesh(
        //     new THREE.PlaneBufferGeometry(500,500,250,250),
        //     new THREE.MeshBasicMaterial({
        //         wireframe: true,
        //         color: 'red'
        //     })
        // )
        // planeHigh.rotateX(3.14/2.0);
        // planeHigh.position.set(0,50,0);
        // this.graphicsWorld.add(planeHigh);

        // Mover la posicion de todos los vehiculos cerca del jugador, para ello espero hasta encontrar todos los vehiculos
        const refreshIntervalId = setInterval(()=>{
            if(this.vehicles.length >= 6 && this.characters.length != 0) {
                // console.log('Encontrados vehiculos para cambiarle la posicion!');
                clearInterval(refreshIntervalId);
                this.vehicles.forEach( (vehicle, i) => {
                    // const vehicleInScene = this.graphicsWorld.getObjectById(vehicle.id);
                    // console.log(vehicleInScene);
                    // vehicleInScene.position.set(5,5,5);
                    // console.log(vehicleInScene.position);
                    // console.log(vehicleInScene);
                    vehicle.collision.position.set(60,-1,-50 + (5*i));
                })
                // console.log(this.characters[0]);
                this.characters[0].characterCapsule.body.position.set(55,10,-50);
            }
        }, 500);
        

    }

    private updateInternal() {

    }






}