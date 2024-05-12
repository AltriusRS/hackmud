export function pad(str: string, length: number, char: string = "", alignment: number = 0): string {
    let pad = "";
    for (let i = 0; i < length - str.length; i++) alignment === 0 ? pad += char : pad = char + pad;
    return pad + str;
}

export function arr_to_str(arr: string[], delimiter: string = " "): string {
    return arr.join(delimiter);
}

export function capitalize(str: string | string[]): string | string[] {
    if (typeof str === "string") return str.charAt(0).toUpperCase() + str.slice(1);
    else if (typeof str === "object") return str.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}



/**
 * @author altrius
 * @description A utility class to handle IKeys
 * @class IKey
 */
export class IKey {
    public name: string;
    public author: string;

    // to string
    toString(): string {
        return `${this.author}#${this.name}`;
    }


    toScript(): string {
        return `${this.name}.${this.author}`;
    }

    get ikey(): string {
        return this.toString();
    }

    set ikey(ikey: string) {
        [this.name, this.author] = ikey.toLowerCase().split(/\.#/g);
    }

    constructor(ikey: string) {
        this.ikey = ikey;
    }

    static fromScript(script: string): IKey {
        const [name, author] = script.toLowerCase().split(".");
        return new IKey(`${name}#${author}`);
    }

    static fromIkey(ikey: string): IKey {
        return new IKey(ikey);
    }
}