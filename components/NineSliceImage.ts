import {NineSlicePlane} from "pixi.js";
import Resources from "../services/Resources";

export default class NineSliceImage extends NineSlicePlane {
    constructor(textureId: string, left: number, top: number, right: number, bottom: number) {
        super(Resources.getTexture(textureId), left, top, right, bottom);
    }
}
