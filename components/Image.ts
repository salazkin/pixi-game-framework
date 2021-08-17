import {Texture, Sprite} from "pixi.js";
import Resources from "../services/Resources";

export default class Image extends Sprite {
    constructor(id?: string) {
        super();
        if (id !== undefined) {
            this.setTexture(id);
        }
    }

    public setTexture(id: string | Texture) {
        if (typeof id === "string") {
            let texture = Resources.getTexture(id);
            if (texture) {
                this.texture = texture;
            } else {
                console.warn(`No Texture "${id}"`);
            }
        } else {
            this.texture = id;
        }
    }
}
