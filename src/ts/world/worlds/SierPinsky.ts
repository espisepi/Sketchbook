import * as THREE from 'three';


export class SierPinsky {

    private videoTexture: THREE.VideoTexture;

    constructor(graphicsWorld, videoTexture) {
        console.log("sierpinsky!");

        this.videoTexture = videoTexture;

        const params = {
            x: 0,
            y: 2,
            z: 0,
            base: 10,
            height: 10,
            it: 5
        };
        this.sierpinsky(graphicsWorld, 0, 15, 0, 20, 20, 5);



    }

    /**
     * Creates a pyramid with THREE
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} b Base
     * @param {number} h Height
     */
    private createPyramid (x, y, z, b, h) : THREE.Mesh {
        const PYRAMID_MATERIAL = new THREE.MeshPhongMaterial({ map: this.videoTexture, side:THREE.DoubleSide });
        const geometry = new THREE.ConeBufferGeometry(b, h, 4, 1);
        const mesh = new THREE.Mesh(geometry, PYRAMID_MATERIAL);

        mesh.position.set(x, y, z);
        // mesh.receiveShadow = true;
        // mesh.shouldBeDeletedOnStateChange = true;

        return mesh;
    };

    /**
 * Sierpinsky algorithm implementation
 * @param {THREE.Scene} scene 
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 * @param {number} b Base
 * @param {number} h Height
 * @param {number} it Number of iterations
 * @param {number} lvl Current level
 */
private sierpinsky (scene, x, y, z, b, h, it, lvl = 0) : void {
    if (it === lvl) {
        scene.add(this.createPyramid(x, y, z, b, h));
    }    
    else {
        const nb = b / 2;
        const nh = h / 2;

        const childs = [
            [ 0, nh / 2 , 0 ],
            [ -nb, -nh / 2, 0 ],
            [ 0, -nh / 2, nb ],
            [ nb, -nh / 2, 0 ],
            [ 0, -nh / 2, -nb ],
        ];

        childs.forEach((point) => {
            this.sierpinsky(scene, x + point[0], y + point[1], z + point[2], nb, nh, it, lvl + 1);
        });
    }
};




}