import Resources from "framework/services/Resources";
import {AnimatedSprite} from "pixi.js";

export default class Animation extends AnimatedSprite {
    constructor(id: string) {
        super(Resources.getAnimationFrames(id));
    }
}
