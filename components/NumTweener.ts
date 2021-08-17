
import {BitmapText, Text} from "pixi.js";
import Tween from "./Tween";

export type NumTweenParams = {
    from?: number;
    to: number;
    duration?: number;
};

export default class NumTweener {

    private tween: Tween;
    private value: number = 0;

    constructor(private tweenTarget: Text | BitmapText, private onUpdate: (target: NumTweener) => void) {

        this.tween = new Tween({
            onUpdate: v => {
                this.value = v;
                this.onUpdate(this);
            }
        });
    }

    public start(params: NumTweenParams) {
        this.tween.stop();
        const from = params.from !== undefined ? params.from : this.value;
        this.tween.params({from, to: params.to, duration: params.duration}).start();
    }

    public setText(str: string) {
        this.tweenTarget.text = str;
    }

    public getValue() {
        return this.value;
    }

    public setValue(value: number): void {
        this.value = value;
    }

    public kill() {
        this.tween.stop();
        this.tweenTarget = null;

    }
}
