
import Resources from "framework/services/Resources";
import Signal from "framework/components/Signal";


export default class SpineAnimation extends PIXI.spine.Spine {

    public animationCompleteSignal: Signal<void> = new Signal();
    constructor(id?: string) {
        super(Resources.getSpineData(id));
    }

    public play(id: string, loop: boolean = false) {
        this.visible = true;
        this.state.clearListeners();
        this.autoUpdate = true;
        if (!loop) {
            this.state.addListener({
                complete: () => {
                    this.state.clearListeners();
                    this.animationCompleteSignal.dispatch();
                }
            });
        }
        this.state.setAnimation(0, id, loop);
        this.updateAnimationFrame();
    }

    private updateAnimationFrame(): void {
        this.state.tracks[0].trackTime = 0;
        this.update(0);
    }

    public getSlotIndex(id: string): number {
        return this.skeleton.slots.findIndex((slot: PIXI.spine.core.Slot) => slot.data.name === id);
    }

    public showStaticFrame(id: string): void {
        this.skeleton.setToSetupPose();
        this.state.clearListeners();
        this.state.clearTracks();
        this.state.setAnimation(0, id, false);
        this.visible = true;
        //this.gotoAndStopOnLastFrame();
    }

    public reset(): void {
        this.autoUpdate = true;
        this.state.clearTracks();
        this.skeleton.setToSetupPose();
    }

    public hide(): void {
        this.visible = false;
    }
}
