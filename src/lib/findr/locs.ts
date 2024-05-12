import { Script } from "./script";


export enum LocRank {
    JUNKRACK = "junkrack",
    DIGGERDECK = "diggerdeck",
    WRECKBOX = "wreckbox",
    PHRAEKRIG = "phreakrig",
    LEETSTACK = "leetstack",
}

export enum LocBuild {
    WVR = "architect",
    TTL = "lock",
    WLF = "infiltrator",
    RVN = "scavenger",
    STG = "executive",
}

export class Loc {
    public rank: LocRank;
    public build: LocBuild;
    public account: string;
    public address: string;

    constructor(rank: LocRank, build: LocBuild, account: string, address: string) {
        this.rank = rank;
        this.build = build;
        this.account = account;
        this.address = address;
    }

    static fromString(name: string): Loc {
        const [_, datablock, ...__] = name.split("_");
        const rank_str = datablock.substring(0, 2);
        const class_str = datablock.substring(2, 5);
        let rank = LocRank.JUNKRACK;
        let build = LocBuild.WVR;

        switch (rank_str) {
            case 'jr': rank = LocRank.JUNKRACK; break;
            case 'dd': rank = LocRank.DIGGERDECK; break;
            case 'wb': rank = LocRank.WRECKBOX; break;
            case 'pr': rank = LocRank.PHRAEKRIG; break;
            case 'ls': rank = LocRank.LEETSTACK; break;
        }

        switch (class_str) {
            case 'wvr': build = LocBuild.WVR; break;
            case 'ttl': build = LocBuild.TTL; break;
            case 'wlf': build = LocBuild.WLF; break;
            case 'rvn': build = LocBuild.RVN; break;
            case 'stg': build = LocBuild.STG; break;
        }
        let [account, address] = name.split(".");

        return new Loc(rank, build, account, address);
    }

    toString(): string {
        return `${this.rank}/${this.build} - ${this.account}.${this.address}`;
    }
}