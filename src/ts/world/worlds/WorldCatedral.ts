import { World } from "../World";
import * as THREE from 'three';
import { ThirdPersonCamera } from "../ThirdPersonCamera";

import { BoxCollider } from '../../physics/colliders/BoxCollider';
import * as Utils from '../../core/FunctionLibrary';
import { SceneOceanOutrun } from "./SceneOceanOutrun";

import { IUpdatable } from '../../interfaces/IUpdatable';




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
        // const refreshIntervalId = setInterval(()=>{
        //     if(this.vehicles.length >= 6 && this.characters.length != 0) {
        //         // console.log('Encontrados vehiculos para cambiarle la posicion!');
        //         clearInterval(refreshIntervalId);
        //         this.vehicles.forEach( (vehicle, i) => {
        //             // const vehicleInScene = this.graphicsWorld.getObjectById(vehicle.id);
        //             // console.log(vehicleInScene);
        //             // vehicleInScene.position.set(5,5,5);
        //             // console.log(vehicleInScene.position);
        //             // console.log(vehicleInScene);
        //             // vehicle.collision.position.set(60,-1,-50 + (5*i));
        //             vehicle.collision.position.set(10,10,0 + (5*i));

        //         })
        //         // console.log(this.characters[0]);
        //         this.characters[0].characterCapsule.body.position.set(20,10,0);
        //     }
        // }, 500);

        this.createFloorPhysics();

        // Pondremos un circuito de curva con physics collider ( a base de cubos en las positions de curva catmullRoll)
        //this.createCurve();
        //this.createCurveInstancedMesh();
        const sceneOceanOutrun = new SceneOceanOutrun(this.graphicsWorld, this.physicsWorld);
        super.registerUpdatable(sceneOceanOutrun);

    }

    private createFloorPhysics() : void {
        const physFloor = new BoxCollider({ size: new THREE.Vector3(10000, 1, 10000) });
        physFloor.body.position.copy(Utils.cannonVector(new THREE.Vector3(0,-1,0)));
        physFloor.body.quaternion.copy(Utils.cannonQuat(new THREE.Quaternion()));
        physFloor.body.computeAABB();
        this.physicsWorld.addBody(physFloor.body);
    }

    private createCurve() : void {

        const circleWidth = 50;
        const circleHeight = 50;
        const numberPoints = 30;
        
        const curve = new THREE.CatmullRomCurve3( [
            new THREE.Vector3( circleWidth/2, 0, 0 ),
            new THREE.Vector3( 0, 0, circleHeight/2 ),
            new THREE.Vector3( -circleWidth/2, 0, 0 ),
            new THREE.Vector3( 0, 0, -circleHeight/2 ),
            new THREE.Vector3( circleWidth/2, 0, 0 )
        ] );

        
        const points: THREE.Vector3[] = curve.getPoints( numberPoints );

        for(let i = 0 ; i < points.length ; i++) {

            let point = points[i];
            
            // Create mesh floor from curve
            const meshFloorSize = {
                x:10,
                y:0.2,
                z:5
            };
            const mesh = new THREE.Mesh(
                new THREE.BoxBufferGeometry(meshFloorSize.x,meshFloorSize.y, meshFloorSize.z),
                new THREE.MeshBasicMaterial({color: new THREE.Color("green")})
            );
            mesh.position.set(point.x,point.y,point.z);
            this.graphicsWorld.add(mesh);

            // Orientamos todos los cubos hacia su siguiente cubo
            const nextPoint : THREE.Vector3 = i >= points.length - 1 ? points[i] : points[i + 1];
            mesh.lookAt(nextPoint);

            // Creamos cubos de paredes a partir de mesh floor
            const meshWallSize = {
                x:0.5,
                y:1,
                z:2
            };
            const meshWall = new THREE.Mesh(
                new THREE.BoxBufferGeometry(meshWallSize.x,meshWallSize.y, meshWallSize.z),
                new THREE.MeshBasicMaterial({color: new THREE.Color("blue")})
            );
            meshWall.position.set(point.x,point.y,point.z);
            meshWall.lookAt(nextPoint);
            const meshRight = meshWall.clone();
            meshRight.translateX(meshFloorSize.x / 2);
            const meshLeft = meshWall.clone();
            meshLeft.translateX(-meshFloorSize.x / 2);
            this.graphicsWorld.add(meshRight);
            this.graphicsWorld.add(meshLeft);


            // Creamos las physics a partir de los meshes anteriores
            mesh.updateMatrix();
            meshLeft.updateMatrix();
            meshRight.updateMatrix();

            // Creamos Floor physics
            const physFloor = new BoxCollider({ size: new THREE.Vector3(meshFloorSize.x/2, meshFloorSize.y/2, meshFloorSize.z/2) });
            physFloor.body.position.copy(Utils.cannonVector(mesh.position));
            physFloor.body.quaternion.copy(Utils.cannonQuat(mesh.quaternion));
            physFloor.body.computeAABB();
            // physFloor.body.shapes.forEach((shape) => {
            //     shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
            // });
            this.physicsWorld.addBody(physFloor.body);
            
            // Creamos Wall Left physics
            const physWallLeft = new BoxCollider({ size: new THREE.Vector3(meshWallSize.x/2, meshWallSize.y/2, meshWallSize.z/2) });
            physWallLeft.body.position.copy(Utils.cannonVector(meshLeft.position));
            physWallLeft.body.quaternion.copy(Utils.cannonQuat(meshLeft.quaternion));
            physWallLeft.body.computeAABB();
            // physFloor.body.shapes.forEach((shape) => {
            //     shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
            // });
            this.physicsWorld.addBody(physWallLeft.body);

            // Creamos Wall Right physics
            const physWallRight = new BoxCollider({ size: new THREE.Vector3(meshWallSize.x/2, meshWallSize.y/2, meshWallSize.z/2) });
            physWallRight.body.position.copy(Utils.cannonVector(meshRight.position));
            physWallRight.body.quaternion.copy(Utils.cannonQuat(meshRight.quaternion));
            physWallRight.body.computeAABB();
            // physFloor.body.shapes.forEach((shape) => {
            //     shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
            // });
            this.physicsWorld.addBody(physWallRight.body);

        }

        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        // Create the final object to add to the scene
        const curveObject = new THREE.Line( geometry, material );
        curveObject.scale.set(10,10,10);
        this.graphicsWorld.add(curveObject);

    }


    // extraer como parametro el mesh del suelo y de los laterales y ponerlo al principio del metodo
    // Pensar en la mejor manera de controlar los parametros para hacerlo lo mas configurable posible
    private createCurveInstancedMesh() : void {

        const circleWidth = 50;
        const circleHeight = 50;
        const numberPoints = 30;
        const meshFloorSize = {
                x:10,
                y:0.2,
                z:5
        };
        const mesh = new THREE.InstancedMesh( 
            new THREE.BoxBufferGeometry(meshFloorSize.x,meshFloorSize.y,meshFloorSize.z),
            new THREE.MeshBasicMaterial({color: new THREE.Color("green")}),
            numberPoints 
        );

        

        const curve = new THREE.CatmullRomCurve3( [
            new THREE.Vector3( circleWidth/2, 0, 0 ),
            new THREE.Vector3( 0, 0, circleHeight/2 ),
            new THREE.Vector3( -circleWidth/2, 2, 0 ),
            new THREE.Vector3( 0, 0, -circleHeight/2 ),
            new THREE.Vector3( circleWidth/2, 0, 0 )
        ] );

        
        const points: THREE.Vector3[] = curve.getPoints( numberPoints );

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
		const rotation = new THREE.Euler();
		const quaternion = new THREE.Quaternion();
		const scale = new THREE.Vector3(1,1,1);

        const meshLookAt = new THREE.Mesh(new THREE.BoxBufferGeometry(1,1,1), new THREE.MeshBasicMaterial({color: new THREE.Color("red")}))
        
        for(let i = 0 ; i < points.length ; i++) {

            let point = points[i];
            
            // Create mesh floor from curve
            // const meshFloorSize = {
            //     x:10,
            //     y:0.2,
            //     z:5
            // };
            // const mesh = new THREE.Mesh(
            //     new THREE.BoxBufferGeometry(meshFloorSize.x,meshFloorSize.y, meshFloorSize.z),
            //     new THREE.MeshBasicMaterial({color: new THREE.Color("green")})
            // );
            // position.set(point.x,point.y,point.z);
            // position.x = Math.random() * 40 - 20;
            // position.y = Math.random() * 40 - 20;
            // position.z = Math.random() * 40 - 20;
            // rotation.x = Math.random() * 2 * Math.PI;
            // rotation.y = Math.random() * 2 * Math.PI;
            // rotation.z = Math.random() * 2 * Math.PI;
            // quaternion.setFromEuler( rotation );
            // scale.x = scale.y = scale.z = Math.random() * 1;

            position.set(point.x,point.y,point.z);

            // Orientamos todos los cubos hacia su siguiente cubo
            const nextPoint : THREE.Vector3 = i >= points.length - 1 ? points[i] : points[i + 1];
            // mesh.lookAt(nextPoint); OLD CODE
            meshLookAt.lookAt(nextPoint);
            meshLookAt.updateMatrix();
            const meshLookAtMatrix = meshLookAt.matrix;
            const meshLookAtPosition = new THREE.Vector3();
            const meshLookAtQuaternion = new THREE.Quaternion();
            meshLookAtMatrix.decompose ( meshLookAtPosition, meshLookAtQuaternion, scale);

            
            // rotation.x = meshLookAt.rotation.x;
            // rotation.y =meshLookAt.rotation.y;
            // rotation.z = meshLookAt.rotation.z;
            // quaternion.setFromEuler( rotation );

            console.log(meshLookAtQuaternion)
            matrix.compose( position, meshLookAtQuaternion, scale );
            mesh.setMatrixAt( i, matrix );
            this.graphicsWorld.add(mesh);
            

            // Creamos cubos de paredes a partir de mesh floor
            const meshWallSize = {
                x:0.5,
                y:1,
                z:2
            };
            const meshWall = new THREE.Mesh(
                new THREE.BoxBufferGeometry(meshWallSize.x,meshWallSize.y, meshWallSize.z),
                new THREE.MeshBasicMaterial({color: new THREE.Color("blue")})
            );
            meshWall.position.set(point.x,point.y,point.z);
            meshWall.lookAt(nextPoint);
            const meshRight = meshWall.clone();
            meshRight.translateX(meshFloorSize.x / 2);
            const meshLeft = meshWall.clone();
            meshLeft.translateX(-meshFloorSize.x / 2);
            this.graphicsWorld.add(meshRight);
            this.graphicsWorld.add(meshLeft);

            mesh.updateMatrix();
            meshLeft.updateMatrix();
            meshRight.updateMatrix();

            // Creamos las physics a partir de los meshes anteriores
            // Creamos Floor physics
            const physFloor = new BoxCollider({ size: new THREE.Vector3(meshFloorSize.x/2, meshFloorSize.y/2, meshFloorSize.z/2) });
            physFloor.body.position.copy(Utils.cannonVector(position));
            physFloor.body.quaternion.copy(Utils.cannonQuat(quaternion));
            physFloor.body.computeAABB();
            // physFloor.body.shapes.forEach((shape) => {
            //     shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
            // });
            this.physicsWorld.addBody(physFloor.body);
            
            // Creamos Wall Left physics
            const physWallLeft = new BoxCollider({ size: new THREE.Vector3(meshWallSize.x/2, meshWallSize.y/2, meshWallSize.z/2) });
            physWallLeft.body.position.copy(Utils.cannonVector(meshLeft.position));
            physWallLeft.body.quaternion.copy(Utils.cannonQuat(meshLeft.quaternion));
            physWallLeft.body.computeAABB();
            // physFloor.body.shapes.forEach((shape) => {
            //     shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
            // });
            this.physicsWorld.addBody(physWallLeft.body);

            // Creamos Wall Right physics
            const physWallRight = new BoxCollider({ size: new THREE.Vector3(meshWallSize.x/2, meshWallSize.y/2, meshWallSize.z/2) });
            physWallRight.body.position.copy(Utils.cannonVector(meshRight.position));
            physWallRight.body.quaternion.copy(Utils.cannonQuat(meshRight.quaternion));
            physWallRight.body.computeAABB();
            // physFloor.body.shapes.forEach((shape) => {
            //     shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
            // });
            this.physicsWorld.addBody(physWallRight.body);

        }

        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        // Create the final object to add to the scene
        const curveObject = new THREE.Line( geometry, material );
        curveObject.scale.set(10,10,10);
        this.graphicsWorld.add(curveObject);

    }


    private updateInternal(): void {



    }






}