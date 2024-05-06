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
    }
}) => {
    const l = $fs.scripts.lib()
    let { op, passthrough } = args as any
    let { ikey } = passthrough

    let query_db = (operand: string, command: unknown, query: unknown): unknown => {
        return JSON.parse($fs.fatalcenturion.db({ operand, command: JSON.stringify(command), query: JSON.stringify(query) }))
    }
    const end = () => {
        let log = l.get_log().join("\n").replaceAll('"', '')
        log = log.split("\\n").join("\n");
        return log
    }

    if (op === "tag" && context.caller === "altrius" && passthrough.tags) {
        let manifest = query_db("f", {}, { ikey })[0]
        $D(JSON.stringify(manifest))
        let tags = (typeof passthrough.tags === "string") ? passthrough.tags.split(",").map((e) => e.trim()) : passthrough.tags

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
    } else if (op === "report") {
        l.log("Reporting script: " + ikey.replace("#", "."))
        let manifest = query_db("f", {}, { ikey })[0]

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
        $D(amount)
        let stats = query_db("f", {}, { __metrics: true })[0]
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
            "last_scan": "Last Scan"
        };


        let metrics = query_db("f", {}, { __metrics: true })[0];
        delete metrics._id;
        delete metrics.__metrics;
        let dono_stats = {
            amt: 0,
            donos: 0,
        }
        let stats = Object.entries(metrics).map(([k, v]) => {
            if (!v) v = 0
            if (k === "donation_sum") dono_stats.amt = v as number
            if (k === "donations") dono_stats.donos = v as number
            if (k === "bot_gc") {
                return {
                    name: names[k],
                    value: v,
                    locale: l.to_gc_str(v as number),
                    length: l.to_gc_str(v as number).length
                }
            }
            if (k === "donation_sum") {
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
        });

        let longest = Math.max(...stats.map((e) => e.length))
        let longestName = Math.max(...stats.map((e) => e.name.length))

        l.log("Metrics for Findr")
        stats.map((e) => {
            l.log(`\`Y${pad(e.name, longestName, 0)}\` | \`N${pad(e.locale, longest, 0)}\``)
        });
        l.log(`\n\`YAverage Donation: ${l.to_gc_str(Math.floor(dono_stats.amt / dono_stats.donos))}\``)
    } else if (op === "open" && context.caller === "altrius") {
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