import {Rect} from "framework/types/Types";
import {Application, Container} from "pixi.js";
import Platform from "../utils/Platform";
import Signal from "../utils/Signal";

type Bounds = {
    min: {width: number, height: number;};
    max: {width: number, height: number;};
};

type BoundsConfig = {
    landscape: Bounds,
    portrait: Bounds;
};

export enum Layout {
    LANDSCAPE,
    PORTRAIT
}

type StageInfo = {
    minBounds: Rect;
    maxBounds: Rect;
    layout: Layout;
    viewWidth: number;
    viewHeight: number;
    scale: number;
};

class Stage {
    private app: Application;
    private screenWidth: number;
    private screenHeight: number;
    private minBoundsRect: Rect = {x: 0, y: 0, w: 1, h: 1};
    private maxBoundsRect: Rect = {x: 0, y: 0, w: 1, h: 1};

    private static stageInfo: StageInfo;
    private static onResizeSignal: Signal<Layout> = new Signal();
    public static onResize(cb: (layout: Layout) => void, context: any): void {
        Stage.onResizeSignal.add(cb, context);
    }
    public static removeListener(cb: (layout: Layout) => void, context: any): void {
        Stage.onResizeSignal.remove(cb, context);
    }

    public static get viewWidth(): number {return Stage.stageInfo.viewWidth;}
    public static get viewHeight(): number {return Stage.stageInfo.viewHeight;}
    public static get minBoundsLeft(): number {return (Stage.viewWidth - Stage.minBoundsWidth) * 0.5;}
    public static get minBoundsRight(): number {return Stage.minBoundsLeft + Stage.minBoundsWidth;}
    public static get minBoundsTop(): number {return (Stage.viewHeight - Stage.minBoundsHeight) * 0.5;}
    public static get minBoundsBottom(): number {return Stage.minBoundsTop + Stage.minBoundsHeight;}
    public static get minBoundsWidth(): number {return Stage.stageInfo.minBounds.w;}
    public static get minBoundsHeight(): number {return Stage.stageInfo.minBounds.h;}
    public static get maxBoundsLeft(): number {return Stage.stageInfo.maxBounds.x;}
    public static get maxBoundsRight(): number {return Stage.maxBoundsLeft + Stage.maxBoundsWidth;}
    public static get maxBoundsTop(): number {return Stage.stageInfo.maxBounds.y;}
    public static get maxBoundsBottom(): number {return Stage.maxBoundsTop + Stage.maxBoundsHeight;}
    public static get maxBoundsWidth(): number {return Stage.stageInfo.maxBounds.w;}
    public static get maxBoundsHeight(): number {return Stage.stageInfo.maxBounds.h;}
    public static get layout(): Layout {return Stage.stageInfo.layout;}
    public static get scale(): number {return Stage.stageInfo.scale;}

    constructor(private boundsConfig: BoundsConfig) {
        this.app = new Application({backgroundColor: 0x000000, antialias: true});

        document.getElementById("game-container").appendChild(this.app.view);
        this.updateStyles();

        window.addEventListener('resize', this.updateFrame, false);
        this.updateFrame();
    }

    public getStage(): Container {
        return this.app.stage;
    }

    private getGameContainer(): HTMLElement {
        return document.getElementById("root");
    }

    private updateStyles(): void {
        const canvas = this.app.view;
        canvas.style.position = "absolute";
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        const gameContainer = this.getGameContainer();
        gameContainer.style.position = "fixed";
        gameContainer.style.backgroundColor = "#000";
    }

    private updateFrame = (): void => {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        const screenRatio = this.screenWidth / this.screenHeight;

        let bounds = this.boundsConfig.landscape;
        let layout = Layout.LANDSCAPE;

        if (Platform.isMobile() && screenRatio < 1) {
            bounds = this.boundsConfig.portrait;
            layout = Layout.PORTRAIT;
        }

        const boundsRatio = bounds.min.width / bounds.min.height;

        this.minBoundsRect.x = this.minBoundsRect.y = 0;
        this.minBoundsRect.w = bounds.min.width;
        this.minBoundsRect.h = bounds.min.height;

        let scale = 1;

        if (screenRatio <= boundsRatio) {
            scale = this.screenWidth / bounds.min.width;
            this.minBoundsRect.y = (this.screenHeight / scale - bounds.min.height) * 0.5;
        } else {
            scale = this.screenHeight / bounds.min.height;
            this.minBoundsRect.x = (this.screenWidth / scale - bounds.min.width) * 0.5;
        }

        const maxOffsetX = (bounds.max.width - bounds.min.width) * 0.5;
        const maxOffsetY = (bounds.max.height - bounds.min.height) * 0.5;

        this.maxBoundsRect.x = Math.max(0, maxOffsetX - this.minBoundsRect.x);
        this.maxBoundsRect.y = Math.max(0, maxOffsetY - this.minBoundsRect.y);
        this.maxBoundsRect.w = bounds.max.width;
        this.maxBoundsRect.h = bounds.max.height;

        const viewWidth = bounds.max.width - this.maxBoundsRect.x * 2;
        const viewHeight = bounds.max.height - this.maxBoundsRect.y * 2;

        const gameContainer = this.getGameContainer();

        gameContainer.style.width = `${(viewWidth * scale).toFixed(0)}px`;
        gameContainer.style.height = `${(viewHeight * scale).toFixed(0)}px`;
        gameContainer.style.left = `${((this.screenWidth - viewWidth * scale) * 0.5).toFixed(0)}px`;
        gameContainer.style.top = `${((this.screenHeight - viewHeight * scale) * 0.5).toFixed(0)}px`;

        this.app.renderer.resize(viewWidth, viewHeight);
        Stage.stageInfo = {minBounds: this.minBoundsRect, maxBounds: this.maxBoundsRect, viewWidth, viewHeight, layout, scale};
        Stage.onResizeSignal.dispatch(layout);
    };
}

export default Stage;
