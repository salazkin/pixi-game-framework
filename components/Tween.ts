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
    static readonly QuadEaseOut = (t: number): number => t * (2 - t);
    static readonly QuadEaseInOut = (t: number): number => (t *= 2) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1);

    static readonly CubicEaseIn = (t: number): number => t * t * t;
    static readonly CubicEaseOut = (t: number): number => --t * t * t + 1;
    static readonly CubicEaseInOut = (t: number): number => (t *= 2) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2);

    static readonly SinEaseIn = (t: number): number => 1 - Math.cos((t * Math.PI) / 2);
    static readonly SinEaseOut = (t: number): number => Math.sin((t * Math.PI) / 2);
    static readonly SinEaseInOut = (t: number): number => 0.5 * (1 - Math.cos(Math.PI * t));

    static readonly CircEaseIn = (t: number): number => 1 - Math.sqrt(1 - t * t);
    static readonly CircEaseOut = (t: number): number => Math.sqrt(1 - --t * t);
    static readonly CircEaseInOut = (t: number): number => (t *= 2) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);

    static readonly ElasticEaseIn = (t: number): number => {
        if (t === 0) {return 0;}
        if (t === 1) {return 1;}
        return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
    };
    static readonly ElasticEaseOut = (t: number): number => {
        if (t === 0) {return 0;}
        if (t === 1) {return 1;}
        return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    };
    static readonly ElasticEaseInOut = (t: number): number => {
        if (t === 0) {return 0;}
        if (t === 1) {return 1;}
        t *= 2;
        return (t < 1) ? -0.5 * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) : 0.5 * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) + 1;
    };

    static readonly BackEaseIn = (t: number): number => {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    };
    static readonly BackEaseOut = (t: number): number => {
        const s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    };
    static readonly BackEaseInOut = (t: number): number => {
        const s = 1.70158 * 1.525;
        return (t *= 2) < 1 ? 0.5 * (t * t * ((s + 1) * t - s)) : 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    };

    static readonly BounceEaseIn = (t: number): number => 1 - Ease.BounceEaseOut(1 - t);
    static readonly BounceEaseOut = (t: number): number => {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        }
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    };
    static readonly BounceEaseInOut = (t: number): number => (t < 0.5) ? Ease.BounceEaseIn(t * 2) * 0.5 : Ease.BounceEaseOut(t * 2 - 1) * 0.5 + 0.5;

};

