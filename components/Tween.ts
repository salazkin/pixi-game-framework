import {Ticker} from "pixi.js";

export type TweenParams = {
    from?: number;
    to?: number;
    duration?: number;
    ease?: (t: number) => number;
    onUpdate?: (value: number) => void;
};

export default class Tween {

    private startTime: number;
    private resolve: (tween: Tween) => void = null;
    private from: number;
    private to: number;
    private duration: number;
    private currentValue: number;
    private ease: (t: number) => number;
    private onUpdate: (value: number) => void;
    private isReverse: boolean = false;
    private static tweens: Set<Tween> = new Set();

    private static add(tween: Tween): void {
        if (this.tweens.size === 0) {
            Ticker.shared.add(this.onEnterFrame, this);
        }
        this.tweens.add(tween);
    }

    private static remove(tween: Tween): void {
        this.tweens.delete(tween);
        if (this.tweens.size === 0) {
            Ticker.shared.remove(this.onEnterFrame);
        }
    }

    private static onEnterFrame(): void {
        const time = this.now();
        this.tweens.forEach((tween) => {
            tween.tick(time);
        });
    }

    private static now(): number {
        return performance.now();
    }

    constructor(params: TweenParams = {}) {
        this.from = params.from || 0;
        this.to = params.to !== undefined ? params.to : 1;

        this.duration = params.duration || 1000;
        this.ease = params.ease || Ease.Linear;
        this.onUpdate = params.onUpdate;
        this.currentValue = this.from;
    }

    public params(params: TweenParams): Tween {
        Object.assign(this, params);
        return this;
    }

    public start(): Promise<Tween> {
        this.isReverse = false;
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.startTime = Tween.now();
            Tween.add(this);
        });
    }

    public reverse(): Promise<Tween> {
        this.isReverse = true;
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.startTime = Tween.now();
            Tween.add(this);
        });
    }

    private tick(time: number): void {
        let progress = (time - this.startTime) / this.duration;
        if (progress > 1) {
            progress = 1;
        }
        if (this.onUpdate) {
            const t = this.ease(progress);
            this.currentValue = this.from + (this.to - this.from) * (this.isReverse ? 1 - t : t);
            this.onUpdate(this.currentValue);
        }
        if (progress >= 1) {
            this.stop();
        }
    }

    public stop(): void {
        Tween.remove(this);
        if (this.resolve) {
            this.resolve(this);
            this.resolve = null;
        }
    }
}


export class Ease {
    static readonly Linear = (t: number) => t;
    static readonly QuadEaseIn = (t: number): number => t * t;
    static readonly QuadEaseOut = (t: number): number => 1 - (1 - t) * (1 - t);

    static readonly SinEaseIn = (t: number): number => -Math.cos(t * Math.PI * 0.5) + 1;
    static readonly SinEaseOut = (t: number): number => Math.sin(t * Math.PI * 0.5);
    static readonly SinEaseInOut = (t: number): number => -0.5 * (Math.cos(Math.PI * t) - 1);

    static readonly CircEaseIn = (t: number): number => -(Math.sqrt(1 - (t * t)) - 1);
    static readonly CircEaseOut = (t: number): number => Math.sqrt(1 - (t = t - 1) * t);
    static readonly CircEaseInOut = (t: number): number => ((t *= 2) < 1) ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
};

