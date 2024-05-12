import { pad } from "./str";

export class Logger {
    _log: string[] = [];
    private _start: number = Date.now();

    constructor() { }

    static init(): Logger {
        // This shouldnt work, but it does, and I'm not going to question it.
        // Probably a bug in the way the game handles classes
        return new (new Logger())();
    }

    public log(...message: any[]): void {
        this.mono_log("`1[  LOG]\`", ...message)
    }

    public info(...message: any[]): void {
        this.mono_log("`2[ INFO]\`", ...message)
    }

    public warn(...message: any[]): void {
        this.mono_log("`5[ WARN]\`", ...message)
    }

    public error(...message: any[]): void {
        this.mono_log("`D[ERROR]\`", ...message)
    }

    public debug(...message: any[]): void {
        this.mono_log("`N[DEBUG]\`", ...message)
    }

    private mono_log(...message: any[]): void {
        this._log.push("`N[" + pad((Date.now() - this._start) + "", 4, "0") + "]` " + message.join(" "));
    }

    public finalize(): string {
        return this._log.join("\n").replaceAll(/^"|"$/g, "");
    }
}

// export function error() {z
//     return end()
// }