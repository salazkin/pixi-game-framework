
import Signal from "framework/components/Signal";
import {Point} from "pixi.js";
import Image from "./Image";

export default class Button extends Image {

    protected down: boolean;
    protected over: boolean;
    protected normalScale = new Point(1, 1);
    protected downScale = 0.95;
    public disabledTextureId: string | null;
    public overTextureId: string | null;
    public downTextureId: string | null;

    public onClickSignal: Signal<Button> = new Signal();
    public onDownSignal: Signal<Button> = new Signal();
    public onUpSignal: Signal<Button> = new Signal();
    public onOvertSignal: Signal<Button> = new Signal();
    public onOutSignal: Signal<Button> = new Signal();

    constructor(private textureId: string = null) {
        super(textureId);

        this.anchor.set(0.5, 0.5);

        this.buttonMode = true;
        this.interactive = true;
        this.downScale = 0.95;

        this.down = false;
        this.over = false;

        this.on('pointerover', this.onOver, this);
        this.on('pointerdown', this.onDown, this);
        this.on('pointerupoutside', this.onOut, this);
        this.on('pointerout', this.onOut, this);
        this.on('pointerup', this.onUp, this);
    }

    protected onDown(): void {
        this.down = true;

        this.scale.set(this.normalScale.x * this.downScale, this.normalScale.y * this.downScale);
        if (this.downTextureId !== undefined) {
            this.setTexture(this.downTextureId);
        }
        this.on('touchmove', this.onTouchMove);
        this.onDownSignal.dispatch(this);
    }

    protected onTouchMove(e: any): void {
        if (!this.containsPoint(e.data.global)) {
            this.off('touchmove', this.onTouchMove);
            this.onOut();
        }
    }

    protected onUp(): void {
        this.scale.set(this.normalScale.x, this.normalScale.y);
        if (this.over) {
            this.onClick();
        }
        if (this.interactive) {
            this.down = false;
            this.setTexture(this.textureId);
        }
        this.onUpSignal.dispatch(this);
    }

    protected onOver(): void {
        this.over = true;
        if (this.overTextureId !== undefined) {
            this.setTexture(this.overTextureId);
        }
        this.onOvertSignal.dispatch(this);
    }

    protected onOut(): void {
        this.over = false;
        this.scale.set(this.normalScale.x, this.normalScale.y);
        this.setTexture(this.textureId);
        this.onOutSignal.dispatch(this);
    }

    protected onClick(): void {
        this.off('touchmove', this.onTouchMove);
        this.onClickSignal.dispatch(this);
    }

    public setEnabled(value: boolean): void {
        if (value) {
            this.enable();
        } else {
            this.disable();
        }
    }

    protected enable(): void {
        if (!this.visible) {
            this.visible = true;
            this.over = false;
        }
        if (!this.interactive) {
            this.interactive = true;
            this.setTexture(this.textureId);
        }
    }

    protected disable(): void {
        if (this.disabledTextureId !== undefined) {
            this.setTexture(this.disabledTextureId);
        }
        this.interactive = false;
        this.over = false;
    }

    public setScale(x: number, y?: number): void {
        this.normalScale.x = x;
        if (y !== undefined) {
            this.normalScale.y = y;
        } else {
            this.normalScale.y = x;
        }
        this.scale.set(this.normalScale.x, this.normalScale.y);
    }

    protected kill(): void {
        this.onClickSignal.removeAll();
        this.onDownSignal.removeAll();
        this.onUpSignal.removeAll();
        this.onOutSignal.removeAll();
        this.off('pointerdown', this.onDown, this);
        this.off('pointerupoutside', this.onOut, this);
        this.off('pointerout', this.onOut, this);
        this.off('pointerup', this.onUp, this);
    }
}
