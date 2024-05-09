/**
 * @author altrius
 * @description A library script for use in other scripts, 
 * primarily for the findr script
 * @caution EARLY ACCESS
 * @level FULLSEC
 */
export default (context: Context, args: {
    op: string,
    passthrough: {
        ikey: string,
        tags?: string[],
        stats?: {
            scripts: number,
            sectors: number,
        },
        amount?: number,
        url?: string,
        usage?: string,
        description?: string,
        regex?: string,
    }
}) => {
    const authUsers = ["_index", "alt_rius", "altrius", "fatalcenturion", "find"];
    let isAdmin = authUsers.includes(context.caller);
    const bot_brain = {
        cooldown: 60 * 15, // 25 minutes = 
        cost: 40500,      // 58K500GC
    }
    const to_hhmmss = (time: number) => {
        time = time / 1000;
        let days = Math.floor(time / 86400);
        time -= days * 86400;
        let hours = Math.floor(time / 3600);
        time -= hours * 3600;
        let minutes = Math.floor(time / 60);
        time -= minutes * 60;
        let seconds = Math.floor(time);
        if(days > 0) return `${days < 10 ? "0" + days : days}:${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        if(hours > 0) return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    }
    const l = $fs.scripts.lib()
    let { op, passthrough } = args as any
    let { ikey } = passthrough

    let query_db = (operand: string, command: unknown, query: unknown): unknown => {
        return $fs.fatalcenturion.db({ operand, command, query }).q
    }
    const end = () => {
        let log = l.get_log().join("\n").replaceAll('"', '')
        log = log.split("\\n").join("\n");
        return log
    }

    if (op === "tag" && isAdmin && passthrough.tags) {
        let tags = (typeof passthrough.tags === "string") ? passthrough.tags.split(",").map((e) => e.trim()) : passthrough.tags
        let mode = passthrough.regex ? 0 : 1;

        if (mode === 0) {
            let count = query_db("c", {}, { ikey: { $regex: passthrough.regex } });
            query_db("u", {
                $set: {
                    tags,
                    z: new Date().getTime(),
                }
            }, { ikey: { $regex: passthrough.regex } })
            l.log(`${count} scripts tagged, thank you`)
        } else if (mode === 1) {
            let manifest = query_db("f", {}, { ikey })[0]
            l.log("Script tagged, thank you")
            if (!manifest) {
                query_db("us", {
                    $set: {
                        __script: true,
                        ikey,
                        level: "unknown",
                        sector: "unknown",
                        tags,
                        reports: [],
                        z: new Date().getTime(),
                    }
                }, { ikey })
            } else {
                query_db("u1", {
                    $set: {
                        tags,
                        z: new Date().getTime(),
                    }
                }, { ikey })
            }
        }
    } else if (op === "report") {
        l.log("Reporting script: " + ikey.replace("#", "."))
        let manifest = query_db("f", {}, { ikey })[0]

        if (ikey.split("#")[0] === context.caller) {
            l.log(`\`DYou can't report your own script\``)
            return end()
        }

        let report = { victim: context.caller, z: new Date().getTime() }
        if (!manifest) {
            query_db("us", {
                $set: {
                    __script: true,
                    ikey,
                    level: "unknown",
                    sector: "unknown",
                    tags: [],
                    reports: [report],
                    z: new Date().getTime(),
                }
            }, { ikey })
        } else {
            if (manifest.level === "fullsec") {
                l.log(`\`DYou can't report a FULLSEC script\``)
                return end()
            }
            if (!manifest.reports) manifest.reports = []
            // // Filter out reports from more than 24 hours ago
            manifest.reports = manifest.reports.filter((e) => e.z > new Date().getTime() - (4_3200_000 * 2))

            let prevReport = manifest.reports.find((e) => e.victim === context.caller);
            let canReport = !prevReport;
            // Check if the user has already reported this script in the last 24 hours
            if (!canReport) {
                l.log(`\`DYou have already reported this script in the last 24 hours\``)
                return end()
            }
            manifest.reports.push(report)
            query_db("u1", {
                $set: {
                    reports: manifest.reports,
                    z: new Date().getTime(),
                }
            }, { ikey })
        }
        let stats = query_db("f", {}, { __metrics: true })[0]
        query_db("u1", {
            $set: {
                reports: stats.reports + 1,
            }
        }, { __metrics: true })

        l.log("Report sent, thank you")
    } else if (op === "search") {
        let stats = query_db("f", {}, { __metrics: true })[0]
        query_db("u1", {
            $set: {
                searches: stats.searches + 1,
                scripts_resolved: stats.scripts_resolved + passthrough.stats.scripts,
                sectors_resolved: stats.sectors_resolved + passthrough.stats.sectors,
            }
        }, { __metrics: true })
    } else if (op === "donate") {
        let amount = args.passthrough.amount;
        let stats = query_db("f", {}, { __metrics: true })[0]
        let donor = query_db("f", {}, { __donation: true, user: context.caller })[0];
        query_db("us", {
            $set: {
                __donation: true,
                user: context.caller,
                amount: (donor.amount ?? 0) + amount,
            }
        }, { __donation: true, user: context.caller })

        query_db("u1", {
            $set: {
                donations: stats.donations + 1,
                donation_sum: stats.donation_sum + amount,
            }
        }, { __metrics: true })
    } else if (op === "metrics") {
        let names = {
            "searches": "Searches Resolved",
            "reports": "Reports Created",
            "scripts": "Scripts Stored",
            "sectors": "Sectors Stored",
            "scripts_resolved": "Scripts Resolved",
            "sectors_resolved": "Sectors Resolved",
            "bot_gc": "Bot Brain GC",
            "donations": "Donations",
            "donation_sum": "Donation Sum",
            "last_scan": "Last Scan",
            "sectors_scanned": "Sectors Per Scan"
        };


        let metrics = query_db("f", {}, { __metrics: true })[0];
        delete metrics._id;
        delete metrics.__metrics;
        let dono_stats = {
            amt: 0,
            donos: 0,
        }
        let last_scan = new Date(metrics.last_scan as number);

        // Add the cooldown to the previous scan
        let next_scan = new Date(last_scan.getTime() + (bot_brain.cooldown) * 1000);
        let difference = next_scan.getTime() - new Date().getTime()
        let countdown = to_hhmmss(Math.abs(difference))
        let stats = Object.entries(metrics).map(([k, v]) => {
            if (!v) v = 0
            if (k === "donation_sum") dono_stats.amt = v as number
            if (k === "donations") dono_stats.donos = v as number
            if (k === "last_scan") return null
            if (k === "sectors_scanned") {
                let v2 = v as number[]
                let total = v2.reduce((a, b) => a + b, 0);
                let average = Math.floor(total / (v2.length ?? 1))
                let per_hour = average * (3600 / bot_brain.cooldown);
                let per_day = per_hour * 24;
                let queue_cycle = (metrics.sectors / per_hour)
                let queue_string = queue_cycle.toFixed(2);
                let [whole, decimal] = queue_string.split(".");
                let queue_cycle_decimal = decimal ? decimal.length : 0;
                if (queue_cycle_decimal < 75) queue_string = `${whole}.75`;
                if (queue_cycle_decimal < 50) queue_string = `${whole}.50`;
                if (queue_cycle_decimal < 25) queue_string = `${whole}.25`;

                queue_cycle = parseFloat(queue_string);

                let text = `${average.toLocaleString()} per scan | ${(average * (3600 / bot_brain.cooldown)).toLocaleString()} per hour | Queue Cycle: ${to_hhmmss(queue_cycle* 3600 * 1000)} `
                return {
                    name: names[k],
                    value: text,
                    locale: text,
                    length: 0
                }
            }
            if (k === "bot_gc" || k === "donation_sum") {
                return {
                    name: names[k],
                    value: v,
                    locale: l.to_gc_str(v as number),
                    length: l.to_gc_str(v as number).length
                }
            }
            return {
                name: names[k],
                value: v,
                locale: v.toLocaleString(),
                length: v.toLocaleString().length
            }
        }).filter(e => e !== null);

        let longest = Math.max(...stats.map((e) => e.length))
        let longestName = Math.max(...stats.map((e) => e.name.length))

        l.log("Metrics for Findr")
        stats.map((e) => {
            l.log(`\`Y${pad(e.name, longestName, 0)}\` | \`N${pad(e.locale, longest, 0)}\``)
        });
        l.log(`\`TLast Scan: ${last_scan.toUTCString()}\``)
        l.log(`\`TNext Scan: ${next_scan.toUTCString()}\``)
        l.log(`\`TCountdown:\` ${countdown}`)
        l.log(`\`TTTL:       ${to_hhmmss(Math.floor(metrics.bot_gc / (bot_brain.cost)) * (bot_brain.cooldown * 1000))} \``)
        l.log(`\n\`YAverage Donation: ${l.to_gc_str(Math.floor(dono_stats.amt / dono_stats.donos))}\``)
    } else if (op === "open" && isAdmin) {
        let url = args.passthrough.url
        let manifest = query_db("f", {}, { ikey })[0]
        if (!manifest) {
            query_db("us", {
                $set: {
                    __script: true,
                    ikey,
                    level: "unknown",
                    sector: "unknown",
                    tags: [],
                    reports: [],
                    z: new Date().getTime(),
                }
            }, { ikey })
        } else {
            query_db("u1", {
                $set: {
                    open: url,
                    z: new Date().getTime(),
                }
            }, { ikey })
        }
    } else if (op === "description" && isAdmin) {
        let description = args.passthrough.description
        let manifest = query_db("f", {}, { ikey })[0]
        if (!manifest) {
            query_db("us", {
                $set: {
                    __script: true,
                    ikey,
                    level: "unknown",
                    sector: "unknown",
                    tags: [],
                    reports: [],
                    z: new Date().getTime(),
                }
            }, { ikey })
        } else {
            query_db("u1", {
                $set: {
                    description,
                    z: new Date().getTime(),
                }
            }, { ikey })
        }
    } else if (op === "usage" && isAdmin) {
        let usage = args.passthrough.usage
        let manifest = query_db("f", {}, { ikey })[0]
        if (!manifest) {
            query_db("us", {
                $set: {
                    __script: true,
                    ikey,
                    level: "unknown",
                    sector: "unknown",
                    tags: [],
                    reports: [],
                    z: new Date().getTime(),
                }
            }, { ikey })
        } else {
            query_db("u1", {
                $set: {
                    usage,
                    z: new Date().getTime(),
                }
            }, { ikey })
        }
    } else {
        l.log("Invalid operation")
    }
    return end()
}

function pad(str: string, length: number, alignment: number = 0): string {
    let pad = "";
    for (let i = 0; i < length - str.length; i++) alignment === 0 ? pad += " " : pad = " " + pad;
    return pad + str;
}