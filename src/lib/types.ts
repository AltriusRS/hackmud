import { Script } from "./findr/script"
import { SecurityLevel } from "./findr/securityLevel"

/**
 * @type {Scriptor}
 * @description A type representing a scriptor as passed by the game itself
 * @property {string} name - The name of the scriptor
 * @property {string} call - The call of the scriptor
 */
export type Scriptor = { name: string, call: (args: any) => unknown }

/**
 * @type {DBQuery}
 * @description A type representing a database query
 * @property {string} operand - The operand of the query
 * @property {string} command - The command of the query
 * @property {unknown} query - The query of the query
 * @property {number} limit - The limit of the query
 * @property {unknown} sort - The sort of the query
 * @property {number} page - The page of the query
 */
export type DBQuery<T> = (operand: string, command: unknown, query: unknown, limit?: number, sort?: unknown, page?: number) => T

/**
 * @type {DBQueryReturn}
 * @description A type representing the return type of a database query
 * @param {unknown} T - The type of the return value
 */
export type DBQueryReturn<T> = T extends (operand: string, command: unknown, query: unknown, limit?: number, sort?: unknown, page?: number) => infer R ? R : never

/**
 * @type {ScriptResult}
 * @description A type representing the result of a script
 * @property {boolean} ok - Whether the script was successful or not
 * @property {string} message - The message of the script result
 * @property {string} start - The start of the script result
 * @property {string} now - The now of the script result
 * @property {string} caller - The caller of the script result
 */
export type ScriptResult = ScriptSuccess | ScriptError

/**
 * @type {ScriptSuccess}
 * @description A type representing a successful script result
 * @property {boolean} ok - Whether the script was successful or not
 * @property {string} message - The message of the script result
 */
export type ScriptSuccess = {
    ok: true,
    message: string,
}

/**
 * @type {ScriptError}
 * @description A type representing an error script result
 * @property {boolean} ok - Whether the script was successful or not
 * @property {string} message - The message of the script result
 * @property {string} start - The start of the script result
 * @property {string} now - The now of the script result
 * @property {string} caller - The caller of the script result
 */
export type ScriptError = {
    ok: false,
    message: string,
    start: string,
    now: string
    caller: string
}


/**
 * @type {StoredDonation}
 * @description A type representing a stored donation
 * @property {string} user - The user who made the donation
 * @property {number} amount - The amount of the donation
 * @property {string} memo - The memo of the donation
 * @property {boolean} __donation - Filter property for mongodb
 * @property {boolean} __anonymous - Whether the donation is anonymous or not
 */
export type StoredDonation = {
    user: string,
    amount: number
    memo?: string
    __donation: true
    __anonymous: boolean
}

/**
 * @type {StoredScript}
 * @description A type representing a stored script
 * @property {IKey} ikey - The IKey of the script
 * @property {string} name - The name of the script
 * @property {string} author - The author of the script
 * @property {string} sector - The sector of the script
 * @property {string} level - The level of the script
 * @property {string[]} tags - The tags of the script
 * @property {string[]} reports - The reports of the script
 * @property {string} usage - The usage of the script
 * @property {string} open - The open of the script
 * @property {string} description - The description of the script
 * @property {number} z - The time the script was last indexed
 * @property {number} a - The time the script was first indexed
 * @property {boolean} __script - Filter property for mongodb
 */
export type StoredScript = {
    ikey: string,
    author: string,
    sector: string,
    level: string,
    tags: string[],
    reports: string[],
    usage: string | null,
    open: string | null,
    description: string | null,
    z: number,
    a: number,
}

/**
 * @type {StoredSector}
 * @description A type representing a sector in the database
 * @property {string} name - The name of the sector
 * @property {number} last_indexed - The last time the sector was indexed
 * @property {string} indexed_by - The user who indexed the sector
 * @property {boolean} __sector - Filter property for mongodb
 */
export type StoredSector = {
    name: string,
    last_indexed: number,
    indexed_by: string
    __sector: true
}


/**
 * @type {Sector}
 * @description A type representing a sector
 * @property {string} sector - The sector of the sector
 * @property {Script[]} scripts - The scripts in the sector
 */
export type Sector = {
    sector: string,
    level: SecurityLevel,
    scripts: Script[]
}

/**
 * @type {SectorList} - A type representing a list of sector names
 */
export type SectorList = string[];

/**
 * @type {ScriptList} - A type representing a list of script names
 */
export type ScriptList = string[];

/**
 * @type {SecurityLevels}
 * @description An object containing all the security levels and their corresponding values
 * @property {number} NULLSEC - The value of the NULLSEC security level
 * @property {number} LOWSEC - The value of the LOWSEC security level
 * @property {number} MIDSEC - The value of the MIDSEC security level
 * @property {number} HIGHSEC - The value of the HIGHSEC security level
 * @property {number} FULLSEC - The value of the FULLSEC security level
 */
export enum SecurityLevels {
    NULLSEC = 0,
    LOWSEC = 1,
    MIDSEC = 2,
    HIGHSEC = 3,
    FULLSEC = 4
}

/**
 * @type {SecurityLevel[]}
 * @description An array of all the security levels ordered by value (from lowest to highest) (which is the same as the display order)
 */
export const securityLevels = [
    new SecurityLevel("NULLSEC", 0),
    new SecurityLevel("LOWSEC", 1),
    new SecurityLevel("MIDSEC", 2),
    new SecurityLevel("HIGHSEC", 3),
    new SecurityLevel("FULLSEC", 4),
]

/**
 * @type {IndexMetrics}
 * @description A type for the metrics of the script index
 * @property {number} searches - The number of times the script index has been searched
 * @property {number} reports - The number of reports created by the script index
 * @property {number} scripts - The number of scripts stored in the script index
 * @property {number} sectors - The number of sectors stored in the script index
 * @property {number} scripts_resolved - The number of scripts resolved by the search
 * @property {number} sectors_resolved - The number of sectors resolved by the search
 * @property {number} balance - The number of times the bot brain has been garbage collected
 * @property {number} donations - The number of donations made by the script index
 * @property {number} donation_sum - The sum of all donations made by the script index
 * @property {BrainMetrics[]} active_brains - The reports of the active bot brains
 * @property {boolean} bool value to allow for quick querying of the metrics
 */
export type IndexMetrics = {
    searches: number,
    reports: number,
    scripts: number,
    sectors: number,
    scripts_resolved: number,
    sectors_resolved: number,
    balance: number,
    donations: number,
    donation_sum: number,
    brains: BrainMetrics[],
    readonly __new_metrics: boolean,
}

/**
 * @type {BrainMetrics}
 * @description A type for the brain metrics
 * @property {number} balance - The balance of the brain
 * @property {number} last_scan - The last time the brain was triggered
 * @property {string} rarity - The rarity of the brain upgrade
 * @property {number} tier - The tier of the brain upgrade
 * @property {number} cooldown - The cooldown of the brain upgrade
 * @property {number} cost - The cost of the brain upgrade
 * @property {number} retries - The number of times the brain has been triggered
 * @property {number[]} scans - The number of sectors scanned by the brain per trigger (max history of 100 entries per brain)
 * @property {number} cpt - The average number of scans per trigger (from BrainMetrics.scans)
 */
export type BrainMetrics = {
    balance: number,
    last_scan: number,
    rarity: string,
    tier: number,
    cooldown: number,
    cost: number,
    retries: number,
    scans: number[]
    cpt: number,
}