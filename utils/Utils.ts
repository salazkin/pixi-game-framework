import {Text} from "pixi.js";

const degreeToRadians = (degrees: number): number => {
    return degrees * Math.PI / 180;
};

const radiansToDegree = (radians: number): number => {
    return radians * 180 / Math.PI;
};

const lerp = (v1: number, v2: number, t: number): number => {
    return v1 + (v2 - v1) * t;
};

const lerpAngle = (v1: number, v2: number, t: number, range: number = 360): number => {
    let result: number;
    const dt = v2 - v1;
    const mid = range * 0.5;
    if (dt < -mid) {
        v2 += range;
        result = lerp(v1, v2, t);
        if (result >= range) {
            result -= range;
        }
    } else if (dt > mid) {
        v2 -= range;
        result = lerp(v1, v2, t);
        if (result < 0) {
            result += range;
        }
    } else {
        result = lerp(v1, v2, t);
    }
    return result;
};

const autoSizeLabel = (target: Text, str: string, maxWidth: number): void => {
    target.scale.set(1);
    target.text = str;
    if (target.width > maxWidth) {
        target.scale.set(maxWidth / target.width);
    }
};

const sequence = (arr: Array<() => Promise<any>>) => arr.reduce((prev, job) => prev.then(job), Promise.resolve());

export {
    degreeToRadians,
    radiansToDegree,
    lerp,
    lerpAngle,
    sequence,
    autoSizeLabel
};
