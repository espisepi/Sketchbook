import * as THREE from 'three';
import { World } from '../World';
import { IUpdatable } from '../../interfaces/IUpdatable';
import { default as CSM } from 'three-csm';

import { Water as WaterThree } from 'three/examples/jsm/objects/Water';


export class Water extends THREE.Object3D implements IUpdatable
{
	public updateOrder: number = 5;

    public waterMesh: WaterThree;

	constructor(graphicsWorld: THREE.Scene, position: THREE.Vector3 = new THREE.Vector3(0,0,0))
	{
		super();

        const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

       const water = new WaterThree(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( 'build/assets/textures/waternormals.jpg', function ( texture ) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                } ),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: graphicsWorld.fog !== undefined
            }
        );

        water.rotation.x = - Math.PI / 2;

        water.position.set(position.x,position.y,position.z);

        graphicsWorld.add( water );

        this.waterMesh = water;
		
    }

    update(timestep: number, unscaledTimeStep: number): void {
        if(this.waterMesh) {
            // @ts-ignore
            this.waterMesh.material.uniforms[ 'time' ].value += 1.0 / 60.0;

        }
    }

}