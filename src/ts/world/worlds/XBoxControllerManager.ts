
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

        const d = document.createElement("div");
        d.style.position = 'absolute';
        d.style.top = '0';
        d.style.right = '0';
        d.style.zIndex = '99999';
        d.style.width = '10vw';
        d.style.height = '5vh'
        d.setAttribute("id", `controller${gamepad.index}`);

        const t = document.createElement("h1");
        t.textContent = `gamepad: ${gamepad.id}`;
        d.appendChild(t);

        const b = document.createElement("div");
        b.className = "buttons";
        gamepad.buttons.forEach((button, i) => {
            const e = document.createElement("span");
            e.className = "button";
            e.textContent = i;
            b.appendChild(e);
        });

        d.appendChild(b);

        const a = document.createElement("div");
        a.className = "axes";

        gamepad.axes.forEach((axis, i) => {
            const p = document.createElement("progress");
            p.className = "axis";
            p.setAttribute("max", "2");
            p.setAttribute("value", "1");
            p.textContent = i;
            a.appendChild(p);
        });

        d.appendChild(a);

        // See https://github.com/luser/gamepadtest/blob/master/index.html
        const start = document.getElementById("start");
        if (start) {
            start.style.display = "none";
        }

        document.body.appendChild(d);
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
            this.controllers.forEach((controller, i) => {
                const d = document.getElementById(`controller${i}`);
                const buttons = d.getElementsByClassName("button");

                // Boton A
                // console.log(this.controllers[0].buttons[0].pressed);
            
                controller.buttons.forEach((button, i) => {
                  const b = buttons[i];
                  let pressed = button === 1.0;
                  let val = button;
            
                  if (typeof button === "object") {
                    pressed = val.pressed;
                    val = val.value;
                  }
            
                  const pct = `${Math.round(val * 100)}%`;
                  // @ts-ignore: Unreachable code error
                  b.style.backgroundSize = `${pct} ${pct}`;
                  b.className = pressed ? "button pressed" : "button";
                });
            
                const axes = d.getElementsByClassName("axis");
                controller.axes.forEach((axis, i) => {
                    const a = axes[i];
                //   a.textContent = `${i}: ${controller.axis.toFixed(4)}`;
                //   a.setAttribute("value", controller.axis + 1);
                    a.textContent = `${i}: ${axis.toFixed(4)}`;
                    a.setAttribute("value", axis + 1);
                });
              });
            
              // requestAnimationFrame(this.updateStatus);
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
      
}