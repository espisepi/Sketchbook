import * as THREE from 'three';
import { BoxCollider } from '../../physics/colliders/BoxCollider';
import * as Utils from '../../core/FunctionLibrary';


export class SceneOceanOutrun {

    public graphicsWorld: THREE.Scene;
	public physicsWorld: CANNON.World;


    constructor(graphicsWorld, physicsWorld) {

        this.graphicsWorld = graphicsWorld;
        this.physicsWorld = physicsWorld;

        this.createCurve();

        console.log("HOLI");


    }

    private createCurve() : void {

        const circleWidth = 50;
        const circleHeight = 50;
        const numberPoints = 30;

        // physics floor box size
        const meshFloorSize = {
            x:10,
            y:0.2,
            z:5
        };
        // graphics floor mesh
        const meshFloor = new THREE.Mesh(
            new THREE.BoxBufferGeometry(meshFloorSize.x,meshFloorSize.y,meshFloorSize.z),
            new THREE.MeshBasicMaterial({color: new THREE.Color("red")})
        );
        // physics wall box size
        const meshWallSize = {
            x:0.5,
            y:1,
            z:2
        };
        // graphics wall mesh
        const meshWall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(meshWallSize.x,meshWallSize.y, meshWallSize.z),
            new THREE.MeshBasicMaterial({color: new THREE.Color("blue")})
        );
        

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
            // const meshFloorSize = {
            //     x:10,
            //     y:0.2,
            //     z:5
            // };
            // const mesh = new THREE.Mesh(
            //     new THREE.BoxBufferGeometry(meshFloorSize.x,meshFloorSize.y, meshFloorSize.z),
            //     new THREE.MeshBasicMaterial({color: new THREE.Color("green")})
            // );
            const mesh = meshFloor.clone();
            mesh.position.set(point.x,point.y,point.z);
            this.graphicsWorld.add(mesh);

            // Orientamos todos los cubos hacia su siguiente cubo
            const nextPoint : THREE.Vector3 = i >= points.length - 1 ? points[i] : points[i + 1];
            mesh.lookAt(nextPoint);

            // Creamos cubos de paredes a partir de mesh floor
            // const meshWallSize = {
            //     x:0.5,
            //     y:1,
            //     z:2
            // };
            // const meshWall = new THREE.Mesh(
            //     new THREE.BoxBufferGeometry(meshWallSize.x,meshWallSize.y, meshWallSize.z),
            //     new THREE.MeshBasicMaterial({color: new THREE.Color("blue")})
            // );
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
}