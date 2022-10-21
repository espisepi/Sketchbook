


export class FullScreen {

    constructor() {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              this.toggleFullScreen();
            }
        }, false);
    }

    public toggleFullScreen(): void {
        try{
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        } catch(e) {
            console.error("API FullScreen no soportada en este navegador. Seguramente sea porque es de Apple y Apple hace lo que le sale de los cojones.");
        }
    }


}