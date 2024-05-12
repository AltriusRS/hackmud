import { securityLevels, SecurityLevels } from "../types";

/**
 * @type {SecurityLevel}
 * @description A class representing a security level
 * @property {string} display - The display name of the security level
 * @property {number} value - The value of the security level
 */
export class SecurityLevel {
    public display: string;
    public value: number;

    /**
     * @description Creates a new instance of SecurityLevel
     * @param {string} display - The display name of the security level
     * @param {number} value - The value of the security level
     */
    constructor(display: string, value: number) {
        this.display = display;
        this.value = value;
    }

    /**
     * @description Creates a new instance of SecurityLevel from a display name
     * @param {string} display - The display name of the security level
     * @returns {SecurityLevel} - The new instance of SecurityLevel
     */
    static fromDisplay(display: string): SecurityLevel {
        let display_upper = display.toUpperCase();
        let match = SecurityLevels[display_upper];
        if (match) return match;
        else return new SecurityLevel("UNKNOWN", -1);
    }

    /**
     * @description Creates a new instance of SecurityLevel from a value
     * @param {number} value - The value of the security level
     * @returns {SecurityLevel} - The new instance of SecurityLevel
     */
    static fromValue(value: number): SecurityLevel {
        let match = securityLevels.find((s) => s.value === value);
        if (match) return match;
        else return new SecurityLevel("UNKNOWN", -1);
    }


    /**
     * @description Returns the display name of the security level
     * @returns {string} - The display name of the security level
     */
    toDisplay(): string {
        let color = "";
        switch (this.value) {
            case 0: color = "T"; break;
            case 1: color = "D"; break;
            case 2: color = "5"; break;
            case 3: color = "3"; break;
            case 4: color = "2"; break;
            default: color = "Y"; break;
        }
        return `\`${color}${this.display}\``;
    }
}