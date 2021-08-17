import Resources from "./Resources";

export default new class Locales {

    private values: {[key: string]: string;} = undefined;
    private lang: string;

    public init(lang: string): void {
        this.lang = lang;
    }

    public getKey(id: string, ...params: Array<number | string>): string {
        if (this.values === undefined) {
            this.values = {};
            const locales: any[] = Resources.getLocales() as Array<any>;
            locales.forEach(data => {
                this.values[data.code] = data[this.lang];
            });
        }
        let out = this.values[id];

        if (out !== undefined) {
            return this.parseStr(out, params);
        } else {
            console.warn(`no '${this.lang}' translation '${id}'`);
            return id;
        }
    }

    private parseStr(str: string, arr: Array<number | string>): string {
        let out = str;
        if (arr.length) {
            for (let i = 0; i < arr.length; i++) {
                const replaceStr = `{${i}}`;
                const index = out.indexOf(replaceStr);
                if (index !== -1) {
                    out = `${out.substring(0, index)}${arr[i]}${out.substring(index + replaceStr.length)}`;
                }
            }
        }
        return out.replace(/\\n/g, "\n");;
    }
};
