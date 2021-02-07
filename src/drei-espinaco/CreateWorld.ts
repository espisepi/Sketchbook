import { World } from '../ts/world/World';
import { IUpdatable } from '../ts/interfaces/IUpdatable';
import { times } from 'lodash';
import * as Utils from '../ts/core/FunctionLibrary';

import * as THREE from 'three';
import { BoxCollider } from '../ts/physics/colliders/BoxCollider';

export class CreateWorld implements IUpdatable {
    
    public updateOrder: number = 20;
    private world: World;

    constructor(world: World) {
        this.world = world;
        this.createAll();
    }

    public createAll(): void {
        const mesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(10,10,10),
            new THREE.MeshBasicMaterial({color:'red'})
        );
        mesh.position.set(0,20,0);
        this.world.graphicsWorld.add(mesh);

        const phys = new BoxCollider({size: new THREE.Vector3(mesh.scale.x, mesh.scale.y, mesh.scale.z)});
        phys.body.position.copy(Utils.cannonVector(mesh.position));
        phys.body.quaternion.copy(Utils.cannonQuat(mesh.quaternion));
        phys.body.computeAABB();
        this.world.physicsWorld.addBody(phys.body);
    }



    public update(timeStep: number): void {

    }
}