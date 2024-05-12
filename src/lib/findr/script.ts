import { query } from "../db";
import { IKey } from "../str";
import { StoredScript } from "../types";
import { SecurityLevel } from "./securityLevel";

/**
 * @type {Script}
 * @description A class representing a script
 * @property {IKey} ikey - The IKey of the script
 * @property {string} name - The name of the script
 * @property {string} author - The author of the script
 * @property {string} sector - The sector of the script
 * @property {SecurityLevel} level - The security level of the script
 * @property {string[]} tags - The tags of the script
 * @property {string[]} reports - The reports of the script
 * @property {string | null} usage - The usage of the script
 * @property {string | null} open - The open of the script
 * @property {string | null} description - The description of the script
 * @property {number} z - The z value of the script
 * @property {number} a - The a value of the script
 * @property {boolean} is_stale - Whether the script is stale or not
 */
export class Script {
    public ikey: IKey;
    public name: string;
    public author: string;
    public sector: string;
    public level: SecurityLevel;
    public tags: string[];
    public reports: string[];
    public usage: string | null;
    public open: string | null;
    public description: string | null;
    public z: number;
    public a: number;
    public is_stale: boolean;

    /**
     * @description Creates a new instance of Script
     * @param {StoredScript} db - The StoredScript object to create the Script from
     */
    constructor(db: StoredScript) {
        this.ikey = IKey.fromIkey(db.ikey);
        this.author = this.ikey.author;
        this.name = this.ikey.name;
        this.sector = db.sector ?? "UNK_NOWN";
        this.level = SecurityLevel.fromDisplay(db.level ?? "");
        this.tags = db.tags ?? [];
        this.reports = db.reports ?? [];
        this.usage = db.usage ?? null;
        this.open = db.open ?? null;
        this.description = db.description ?? null;
        this.z = db.z ?? new Date().getTime();
        this.a = db.a ?? new Date().getTime();
        this.is_stale = new Date().getTime() - this.z > 24 * 60 * 60 * 1000;// Mark as stale if the script is older than 24 hours
    }

    /**
     * @description Creates a new instance of Script from a StoredScript object
     * @param {StoredScript} db - The StoredScript object to create the Script from
     * @returns {Script} - The new instance of Script
     */
    static fromDB(db: StoredScript): Script {
        return new Script(db);
    }

    /**
     * @description Returns the stored script as a StoredScript object
     * @returns {StoredScript} - The stored script as a StoredScript object
     */
    toDB(): StoredScript {
        return {
            ikey: this.ikey.toString(),
            author: this.author,
            sector: this.sector,
            level: this.level.display,
            tags: this.tags,
            reports: this.reports,
            usage: this.usage,
            open: this.open,
            description: this.description,
            z: this.z,
            a: this.a
        }
    }

    report(report: string): void {
        this.reports.push(report);

    }

    flush(): void {
        let stored = this.toDB();
        query("us", { $set: stored }, { __script: true, ikey: this.ikey.toString() });

    }
}
