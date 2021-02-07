import * as THREE from 'three';

export class ThirdPersonCamera {

    public _cameraOperator: any;
    public _camera: any;
    public _currentPosition: THREE.Vector3;
    public _currentLookat: THREE.Vector3;

    constructor(cameraOperator) {
      this._cameraOperator = cameraOperator;
      this._camera = cameraOperator.camera;
  
      this._currentPosition = new THREE.Vector3();
      this._currentLookat = new THREE.Vector3();
    }
  
    // zoomType -> 0 (3rd person), 1 (1st person)
    _CalculateIdealOffset(zoomType = 0) {
      const idealOffset = new THREE.Vector3(0, 0.5, -2);
      const quaternion = new THREE.Quaternion();
      // quaternion.setFromEuler(this._cameraOperator.rotation);
      idealOffset.applyQuaternion(quaternion);
      idealOffset.add(this._cameraOperator.target);
      return idealOffset;
    }
  
    _CalculateIdealLookat() {
      const idealLookat = new THREE.Vector3(0, 0, 0);
      const quaternion = new THREE.Quaternion();
      // quaternion.setFromEuler(this._cameraOperator.rotation);
      idealLookat.applyQuaternion(quaternion);
      idealLookat.add(this._cameraOperator.target);
      return idealLookat;
    }
  
    Update(timeElapsed, zoomType) {
      const idealOffset = this._CalculateIdealOffset(zoomType);
      const idealLookat = this._CalculateIdealLookat();
  
      // const t = 0.05;
      // const t = 4.0 * timeElapsed;
      const t = 1.0 - Math.pow(0.001, timeElapsed);
  
      this._currentPosition.lerp(idealOffset, t);
      this._currentLookat.lerp(idealLookat, t);
  
      this._camera.position.copy(this._currentPosition);
      this._camera.lookAt(this._currentLookat);
    }
  }