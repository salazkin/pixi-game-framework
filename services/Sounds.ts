import {Howler, Howl, HowlOptions} from "howler";

export default new class Sounds {

    private howl: Howl;
    private options: HowlOptions;

    private mute: boolean;

    constructor() {
        Howler.autoSuspend = false;
    }

    public load(options: HowlOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.options = options;
            this.howl = new Howl(options);
            this.howl.once('load', resolve);
        });
    }

    public kill() {
        this.howl.unload();
    }

    public setMute(value: boolean) {
        this.mute = value;
        Howler.mute(value);
    }

    public isMute(): boolean {
        return this.mute;
    }

    public play(soundName: string, volume = 1): number {
        const id = this.howl.play(soundName);
        return id;
    }

    public stop(id: number) {
        this.howl.stop(id);
    }

    public fadeIn(id: number, duration: number) {
        this.howl.fade(0, 1, duration, id);
    }

    public fadeOut(id: number, duration: number) {
        this.howl.fade(1, 0, duration, id);
    }

    public setGlobalVolume(value: number) {
        Howler.volume(value);
    }

    public getGlobalVolume(): number {
        return Howler.volume();
    }

};
