
import {BitmapText, Text} from "pixi.js";
import Tween from "../utils/Tween";

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

    public start(params: NumTweenParams): void {
        this.tween.stop();
        const from = params.from !== undefined ? params.from : this.value;
        this.tween.params({from, to: params.to, duration: params.duration}).start();
    }

    public setText(str: string): void {
        this.tweenTarget.text = str;
    }

    public getValue(): number {
        return this.value;
    }

    public setValue(value: number): void {
        this.value = value;
    }

    public kill(): void {
        this.tween.stop();
        this.tweenTarget = null;

    }
}
