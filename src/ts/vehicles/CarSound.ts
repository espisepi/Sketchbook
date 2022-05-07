import * as CANNON from 'cannon';

import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { KeyBinding } from '../core/KeyBinding';
import * as THREE from 'three';
import * as Utils from '../core/FunctionLibrary';
import { SpringSimulator } from '../physics/spring_simulation/SpringSimulator';
import { World } from '../world/World';
import { EntityType } from '../enums/EntityType';
import { Audio } from 'three';

import { Car } from './Car';


export class CarSound extends Car implements IControllable
{
	private sound: Audio;

	private isPlayed: boolean = false;

	constructor(gltf: any)
	{
		super(gltf);

		this.loadCarSound();
	}

	public loadCarSound() {

		// this.audio = new Audio("");

		const listener = new THREE.AudioListener();
		super.add( listener ); //super its an Object3D (Car extends Vehicle and Vechicle extends THREE.Object3D)

		const sound = new THREE.Audio( listener );
		const audioLoader = new THREE.AudioLoader();
		audioLoader.load( 'build/assets/car_engine.wav', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.5 );
			// sound.play();
			// sound.detune = 1000;
		});
		this.sound = sound;

	}

	public update(timeStep: number): void
	{
		super.update(timeStep);


		if(this.isPlayed === false && this.controllingCharacter) {
			this.isPlayed = true;
			this.sound.play();
		}

		if(this.isPlayed === true && this.controllingCharacter === undefined) {
			this.isPlayed = false;
			this.sound.stop();
		}

		if(this.controllingCharacter) {
			// console.log(super.getSpeed() * 100)
			// this.sound.detune = super.getSpeed() * 100;
			// this.sound.stop();
			// this.sound.play();
			this.sound.setDetune(super.getSpeed() * 50);
		}

	}

}