
import { io, Socket } from "socket.io-client";
import { World } from "../sketchbook";

import * as THREE from 'three';


export class MultiplayerWorld {

    public socket: Socket;
    public world: World;

    constructor(world: World) {
        console.log("Creado!ª!!!!!!!!!!!!!!!!!!");    
        const socket = io("http://localhost:1989/", {
            reconnectionDelayMax: 10000,
            // auth: {
            // token: "123"
            // },
            // query: {
            // "my-key": "my-value"
            // }
        });
        console.log(socket);

        this.socket = socket;
        this.world = world;

        this.attachEvents();
        console.log(world);
    }

    private attachEvents(): void {
        // Llamar a evento move para el servidor cada vez que se pulse una tecla (input)
        // document.onkeypress = function (e: any) {
        //     e = e || window.event;
        //     // use e.keyCode
        //     console.log("teclA PIULSADAª!");
        // };
        // this.socket.emit('move', [glScene.camera.position.x, glScene.camera.position.y, glScene.camera.position.z]);
        const socket = this.socket;
        const self = this;
        setInterval(()=>{
            if(self.world.characters.length != 0) {
                // console.log(socket);
                const character = this.world.characters[0];
                socket.emit('move', [character.position.x, character.position.y, character.position.z]);
            }
        },1000);

        let clients = new Object();
        let id;
        let instances = [];

        //On connection server sends the client his ID
        socket.on('introduction', (_id, _clientNum, _ids)=>{

            for(let i = 0; i < _ids.length; i++){
            if(_ids[i] != _id){
                clients[_ids[i]] = {
                mesh: new THREE.Mesh(
                    new THREE.BoxGeometry(10,10,10),
                    new THREE.MeshNormalMaterial({side: THREE.DoubleSide})
                )
                }
        
                //Add initial users to the scene
                this.world.graphicsWorld.add(clients[_ids[i]].mesh);
            }
            }
        
            console.log(clients);
        
            id = _id;
            console.log('My ID is: ' + id);
        
        });
        
        socket.on('newUserConnected', (clientCount, _id, _ids)=>{
            console.log(clientCount + ' clients connected');
            let alreadyHasUser = false;
            for(let i = 0; i < Object.keys(clients).length; i++){
            if(Object.keys(clients)[i] == _id){
                alreadyHasUser = true;
                break;
            }
            }
            if(_id != id && !alreadyHasUser){
            console.log('A new user connected with the id: ' + _id);
            clients[_id] = {
                mesh: new THREE.Mesh(
                new THREE.BoxGeometry(1,1,1),
                new THREE.MeshNormalMaterial()
                )
            }
        
            //Add initial users to the scene
            this.world.graphicsWorld.add(clients[_id].mesh);
            }
        
        });
        
        socket.on('userDisconnected', (clientCount, _id, _ids)=>{
            //Update the data from the server
            document.getElementById('numUsers').textContent = clientCount;
        
            if(_id != id){
            console.log('A user disconnected with the id: ' + _id);
            this.world.graphicsWorld.remove(clients[_id].mesh);
            delete clients[_id];
            }
        });
        
        socket.on('connect', ()=>{});
        
        //Update when one of the users moves in space
        socket.on('userPositions', _clientProps =>{
            console.log('Positions of all users are ', _clientProps, id);
            // console.log(Object.keys(_clientProps)[0] == id);
            for(let i = 0; i < Object.keys(_clientProps).length; i++){
            if(Object.keys(_clientProps)[i] != id){
        
                //Store the values
                let oldPos = clients[Object.keys(_clientProps)[i]].mesh.position;
                let newPos = _clientProps[Object.keys(_clientProps)[i]].position;
        
                //Create a vector 3 and lerp the new values with the old values
                let lerpedPos = new THREE.Vector3();
                lerpedPos.x = THREE.MathUtils.lerp(oldPos.x, newPos[0], 0.3);
                lerpedPos.y = THREE.MathUtils.lerp(oldPos.y, newPos[1], 0.3);
                lerpedPos.z = THREE.MathUtils.lerp(oldPos.z, newPos[2], 0.3);
        
                //Set the position
                clients[Object.keys(_clientProps)[i]].mesh.position.set(lerpedPos.x, lerpedPos.y, lerpedPos.z);
            }
            }
        });


    }    


}