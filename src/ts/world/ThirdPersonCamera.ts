import * as THREE from 'three';

export class ThirdPersonCamera {

    public _target: any;
    public _camera: any;
    public _currentPosition: THREE.Vector3;
    public _currentLookat: THREE.Vector3;

    constructor(target,camera) {
      this._target = target;
      this._camera = camera;
  
      this._currentPosition = new THREE.Vector3();
      this._currentLookat = new THREE.Vector3();
    }
  
    // zoomType -> 0 (3rd person), 1 (1st person)
    _CalculateIdealOffset(zoomType = 0) {
      const idealOffset = new THREE.Vector3(0, 0.5, -2);
      const quaternion = new THREE.Quaternion();
      quaternion.setFromEuler(this._target.rotation);
      idealOffset.applyQuaternion(quaternion);
      idealOffset.add(this._target.position);
      return idealOffset;
    }
  
    _CalculateIdealLookat() {
      const idealLookat = new THREE.Vector3(0, 0, 0);
      const quaternion = new THREE.Quaternion();
      quaternion.setFromEuler(this._target.rotation);
      idealLookat.applyQuaternion(quaternion);
      idealLookat.add(this._target.position);
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