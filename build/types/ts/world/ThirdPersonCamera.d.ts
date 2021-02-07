import * as THREE from 'three';
export declare class ThirdPersonCamera {
    _cameraOperator: any;
    _camera: any;
    _currentPosition: THREE.Vector3;
    _currentLookat: THREE.Vector3;
    constructor(cameraOperator: any);
    _CalculateIdealOffset(zoomType?: number): THREE.Vector3;
    _CalculateIdealLookat(): THREE.Vector3;
    Update(timeElapsed: any, zoomType: any): void;
}
