
// https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
export class XBoxControllerManager {

    public haveEvents: boolean = 'ongamepadconnected' in window;
    public controllers: any = [];


    constructor() {
        window.addEventListener("gamepadconnected", (e) => this.connecthandler(e), false);
        window.addEventListener("gamepaddisconnected",(e) => this.disconnecthandler(e), false);    
    }

    public connecthandler(e: any): void {
        console.log("OYEEEE");
        console.log(e);
        this.addgamepad(e.gamepad);
    }

    public disconnecthandler(e): void {
        this.removegamepad(e.gamepad);
    }

    public addgamepad(gamepad: any) {
        this.controllers[gamepad.index] = gamepad;

         // const d = document.createElement("div");
        // d.style.position = 'absolute';
        // d.style.top = '0';
        // d.style.right = '0';
        // d.style.zIndex = '99999';
        // d.style.width = '10vw';
        // d.style.height = '5vh'
        // d.setAttribute("id", `controller${gamepad.index}`);

        // const t = document.createElement("h1");
        // t.textContent = `gamepad: ${gamepad.id}`;
        // d.appendChild(t);

        // const b = document.createElement("div");
        // b.className = "buttons";
        // gamepad.buttons.forEach((button, i) => {
        //     const e = document.createElement("span");
        //     e.className = "button";
        //     e.textContent = i;
        //     b.appendChild(e);
        // });

        // d.appendChild(b);

        // const a = document.createElement("div");
        // a.className = "axes";

        // gamepad.axes.forEach((axis, i) => {
        //     const p = document.createElement("progress");
        //     p.className = "axis";
        //     p.setAttribute("max", "2");
        //     p.setAttribute("value", "1");
        //     p.textContent = i;
        //     a.appendChild(p);
        // });

        // d.appendChild(a);

        // // See https://github.com/luser/gamepadtest/blob/master/index.html
        // const start = document.getElementById("start");
        // if (start) {
        //     start.style.display = "none";
        // }

        // document.body.appendChild(d);
        // requestAnimationFrame(this.updateStatus);
    }

    public removegamepad(gamepad) {
        const d = document.getElementById(`controller${gamepad.index}`);
        document.body.removeChild(d);
        delete this.controllers[gamepad.index];
    }

    public updateStatus() {
        if (!this.haveEvents) {
          this.scangamepads();
        }
      
        if(this.controllers && this.controllers.length != 0) {
        //     this.controllers.forEach((controller, i) => {
        //         // const d = document.getElementById(`controller${i}`);
        //         // const buttons = d.getElementsByClassName("button");


                this.mappingController();
            
        //       //   controller.buttons.forEach((button, i) => {
        //       //     const b = buttons[i];
        //       //     let pressed = button === 1.0;
        //       //     let val = button;
            
        //       //     if (typeof button === "object") {
        //       //       pressed = val.pressed;
        //       //       val = val.value;
        //       //     }
            
        //       //     const pct = `${Math.round(val * 100)}%`;
        //       //     // @ts-ignore: Unreachable code error
        //       //     b.style.backgroundSize = `${pct} ${pct}`;
        //       //     b.className = pressed ? "button pressed" : "button";
        //       //   });
            
        //       //   const axes = d.getElementsByClassName("axis");
        //       //   controller.axes.forEach((axis, i) => {
        //       //       const a = axes[i];
        //       //   //   a.textContent = `${i}: ${controller.axis.toFixed(4)}`;
        //       //   //   a.setAttribute("value", controller.axis + 1);
        //       //       a.textContent = `${i}: ${axis.toFixed(4)}`;
        //       //       a.setAttribute("value", axis + 1);
        //       //   });
        //       // });
            
        //       // requestAnimationFrame(this.updateStatus);
        }
        
      }

      public scangamepads() {
        const gamepads = navigator.getGamepads();
        for (const gamepad of gamepads) {
          if (gamepad) { // Can be null if disconnected during the session
            if (gamepad.index in this.controllers) {
              this.controllers[gamepad.index] = gamepad;
            } else {
              this.addgamepad(gamepad);
            }
          }
        }
      }

      private mappingController(): void {
          const controllerIndex = 0;
          const controller = this.controllers[controllerIndex];
          this.mappingControllerInternal(controller); // Lo hago de esta manera para poder tener la chuletilla de abajo a mano
          // // Boton A
          // console.log(controller.buttons[0].pressed);
          // // Boton B
          // console.log(controller.buttons[1].pressed);
          // // Boton X
          // console.log(controller.buttons[2].pressed);
          // // Boton Y
          // console.log(controller.buttons[3].pressed);
          // // Boton L1
          // console.log(controller.buttons[4].pressed);
          // // Boton R1
          // console.log(controller.buttons[5].pressed);
          // // Boton L2
          // console.log(controller.buttons[6].pressed);
          // // Boton R2
          // console.log(controller.buttons[7].pressed);
          // // Boton Select
          // console.log(controller.buttons[8].pressed);
          // // Boton Start
          // console.log(controller.buttons[9].pressed);
          // // Boton L3
          // console.log(controller.buttons[10].pressed);
          // // Boton R3
          // console.log(controller.buttons[11].pressed);
          // // Boton Arriba
          // console.log(controller.buttons[12].pressed);
          // // Boton Abajo
          // console.log(controller.buttons[13].pressed);
          // // Boton izquierda
          // console.log(controller.buttons[14].pressed);
          // // Boton derecha
          // console.log(controller.buttons[15].pressed);
          // // Boton unknow
          // console.log(controller.buttons[16].pressed);
          // // joystick izq izq-dcha izq:-1 dcha:+1
          // console.log(controller.axes[0]);
          // // joystick izq arriba-abajo arriba:-1 abajo:+1
          // console.log(controller.axes[1]);
          // // joystick dcha izq-dcha izq:-1 dcha:+1
          // console.log(controller.axes[2]);
          // // joystick dcha arriba-abajo arriba:-1 abajo:+1
          // console.log(controller.axes[3]);

      }

      private mappingControllerInternal(controller : any) : void {
        if(!controller) return;
        // console.log(controller.axes[0]);
        // Pulsar joystick izq izq-dcha izq:-1 dcha:+1
        if(controller.axes[0] >= -1.0 && controller.axes[0] < -0.1) {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' }));
        } else {
          document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', code: 'KeyA' }));
        }
      }
      
}