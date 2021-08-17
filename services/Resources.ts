import {HowlOptions} from "howler";
import {Loader, Texture, utils} from "pixi.js";
import Platform from "../utils/Platform";
import Sounds from "./Sounds";

export default new class Resources {

    private version: number;
    public url: string = "";
    private loader: Loader;
    private spineAtlasesIds: string[] = [];

    public init(url: string): Promise<any> {
        this.url = url;
        this.loader = new Loader();

        this.loader.pre((res: any, cb: () => void) => {

            const atlasScale = Platform.isMobile() ? 0.5 : 1;

            if (res.url.indexOf("/version.json") !== -1) {
                res.url += `?v=${"0000000000".split("").map(c => Math.floor(Math.random() * 10)).join("")}`;
            }

            if (res.url.indexOf("/spine/") !== -1 && res.url.indexOf(".json") === -1) {
                const path = res.url.substring(res.url.indexOf("/spine/") + 1, res.url.length).split("/");
                if (path[path.length - 1].indexOf(".atlas") !== -1) {
                    path[path.length - 1] = path[1] + ".atlas"; //spine loader will try to load atlas with the same ID as json. This will change atlas ID to dir name.
                }
                path.splice(2, 0, atlasScale); //add spine atlas scale
                res.url = url + path.join("/");
            }

            if (res.url.indexOf("atlases/") !== -1 && res.url.indexOf(".json") !== -1) {
                res.url = `${res.url.substring(0, res.url.lastIndexOf("."))}@${atlasScale}x.json`; //add atlas scale 
            }

            if (this.version !== undefined && res.url.indexOf("?") === -1) {
                res.url += `?v=${this.version}`; //add version
            }

            cb();
        });

        this.loader.add(this.url + "version.json");
        return new Promise<void>(resolve => {
            this.loader.load(() => {
                const versionJson = this.loader.resources[this.url + "version.json"].data;
                if (versionJson) {
                    this.version = versionJson.version;
                }
                resolve();
            });
        });
    }

    public async loadStatic(manifest: string[]): Promise<any> {
        await this.loadPixiAssets(manifest);
        await this.loadSounds(manifest);
    }

    private loadPixiAssets(manifest: string[]): Promise<any> {
        let spinePostLoad: string[] = [];
        for (let i = 0; i < manifest.length; i++) {
            let src = this.url + manifest[i];

            let skip = false;

            if (manifest[i].indexOf("spine/") !== -1) {
                const atlasId = manifest[i].split("/")[1];
                if (this.spineAtlasesIds.indexOf(atlasId) === -1) {
                    this.spineAtlasesIds.push(atlasId);
                } else {
                    skip = true;
                    spinePostLoad.push(manifest[i]);
                }
            }

            if (!skip) {
                this.loader.add(src);
            }
        }

        return new Promise<void>(resolve => {
            this.loader.load(() => {
                if (spinePostLoad.length) {
                    spinePostLoad.forEach(spineSrc => {
                        const atlasId = spineSrc.split("/")[1];
                        const atlas = this.getSpineAtlas(atlasId);
                        this.loader.add(this.url + spineSrc, {metadata: {spineAtlas: atlas}} as any);
                    });
                    this.loader.load(() => {resolve();});
                } else {
                    resolve();
                }
            });
        });
    }

    private loadSounds(manifest: string[]): Promise<any> {
        return new Promise<void>(resolve => {
            if (manifest.filter(str => str.indexOf("sounds/") !== -1).length) {
                Sounds.load(this.getSoundsManifest()).then(resolve);
            } else {
                resolve();
            }
        });
    }

    private getSpineAtlas(id: string): PIXI.spine.core.TextureAtlas {
        for (let key in this.loader.resources) {
            const matchStr = `/spine/${id}/`;
            const ext = key.substring(key.lastIndexOf("."), key.length);
            if (key.indexOf(matchStr) !== -1 && ext === ".json") {
                return this.loader.resources[key].spineAtlas;
            }
        }
    }

    private getSoundsManifest(): HowlOptions {
        const path = "sounds/";
        const soundsJson = this.loader.resources[this.url + "sounds/sounds.json"].data;
        const data: HowlOptions = JSON.parse(JSON.stringify(soundsJson));
        if (Array.isArray(data.src)) {
            data.src = data.src.map(src => `${this.url}${path}${src}`);
        } else {
            data.src = `${this.url}${path}${data.src}`;
        }
        return data;
    }

    public loadFonts(manifest: string[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.all(manifest.map(file => this.loadFont(file))).then(() => {
                resolve();
            });
        });
    }

    private loadFont(path: string): Promise<void> {
        const fontFamily = this.getFileName(path);
        return new Promise<void>((resolve, reject) => {
            if ((window as any).FontFace) {
                new FontFace(fontFamily, `url(${this.url + path})`).load().then(font => {
                    document.fonts.add(font);
                    resolve();
                }).catch(e => {
                    reject(e);
                    throw e;
                });
            };
        });
    };

    private getFileName(str: string): string {
        return str.slice(str.lastIndexOf('/') + 1, str.lastIndexOf('.'));
    }

    public getLoaderProgress(): number {
        return this.loader.progress * 0.01;
    }

    public getTexture(textureId: string): Texture {
        const resources = this.loader.resources;
        const img = resources[`${this.url}images/${textureId}.jpg`] || resources[`${this.url}images/${textureId}.png`];

        if (img) {
            return img.texture;
        } else {
            if (utils.TextureCache[textureId + ".png"]) {
                return Texture.from(textureId + ".png");
            }
        }
    }

    public getLocales(): object {
        return this.loader.resources[this.url + "i18n/locales.json"].data;
    }

    public getAnimationFrames(id: string): Texture[] {
        const res = this.loader.resources;
        let atlas = null;
        for (let key in res) {
            if (res[key].spritesheet && res[key].spritesheet.animations[id]) {
                atlas = res[key];
            }
        }

        return atlas.spritesheet.animations[id];
    }

    public getSpineData(id: string): any {
        for (let key in this.loader.resources) {
            const ext = key.substring(key.lastIndexOf("."), key.length);
            const matchStr = `/${id}.json`;
            if (key.indexOf("/spine/") !== -1 && ext === ".json" && key.indexOf(matchStr) !== -1) {
                return this.loader.resources[key].spineData;
            }
        }
    }

    public getJson(id: string): object {
        console.log(id);
        console.log(this.loader.resources);

        return this.loader.resources[`${this.url}config/${id}.json`].data;
    }

};
