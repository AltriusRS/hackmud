/**
 * @author altrius
 * @description A bot brain for finding scripts and indexing them into the database
 * @level NULLSEC
 */

import { query } from "../lib/db";
import { Logger } from "../lib/logs";
import { pad } from "../lib/str";
import { IndexMetrics, StoredSector } from "../lib/types";

/**
 * @description A bot brain for finding scripts and indexing them into the database
 * @param {Context} context - The context of the bot brain
 * @param {any} args - The arguments passed to the bot brain
 * @returns {IndexMetrics} - The index metrics of the bot brain
 */
export default (context: Context, args: {}) => {
    const _START = Date.now();
    const logger = Logger.init();
    // const _s_err = new Error("standard error");
    try {

        logger.debug("Starting bot brain");
        logger.debug("Context: " + JSON.stringify(context));
        logger.debug("Args: " + JSON.stringify(args));
        logger.info("Tracking user upgrades");
        // Load the upgrades of the bot brain
        const upgrades = $hs.sys.upgrades({ is_script: true, full: true, /*filter: { loaded: true }*/ }) as any[];


        let upgs = upgrades.filter((e) => /cron_bot_v[0-9]+/.test(e.name) && e.loaded);
        let unloaded = upgrades.filter((e) => /cron_bot_v[0-9]+/.test(e.name) && !e.loaded);

        let serial_number;
        let cooldown = 0;
        let triggerCost = 0;

        if (upgs.length > 0) {
            logger.info("Found " + upgs.length + " upgrades");
            logger.info("Index | Serial Number            | Name        | Rarity | Cooldown | Trigger Cost");
            let upgrade = upgs[0];
            cooldown = upgrade.cooldown;
            triggerCost = upgrade.cost;
            serial_number = upgrade.sn;
            logger.info("`N" + pad(upgrade.i + "", 5, " ", 1) + "` | `j" + upgrade.sn + "` | " + upgrade.name + " | " + upgrade.rarity + "      | " + pad(upgrade.cooldown + "", 8, " ", 1) + " | " + pad(upgrade.cost + "", 10, " ", 1));
        } else {
            logger.warn("No upgrades found");
            logger.error("Cannot proceed without having at least one cron_bot_v* upgrade installed");
            if (unloaded.length > 0) {
                logger.info("Unloaded upgrades found");
                logger.info("Index | Serial Number            | Name        | Rarity");
                for (const upg of unloaded) {
                    logger.info("`N" + pad(upg.i + "", 5, " ", 1) + "` | `j" + upg.sn + "` | " + upg.name + " | " + upg.rarity);
                }
                logger.info("Please load one of the above upgrades to proceed");
            } else {
                logger.error("No valid upgrades in inventory");
                logger.error("Please load at least one cron_bot_v* upgrade to proceed")
            }

            // Quit early
            return logger.finalize();
        }

        let channels = $ms.chats.channels();
        if (!channels.includes("findocron")) $ms.chats.join({ channel: "findocron" });

        let rpd = (3600 * 24) / cooldown;
        let cpd = triggerCost * rpd;

        logger.info("Cooldown: " + cooldown + " seconds");
        logger.info("Trigger Cost: " + triggerCost + "GC");
        logger.info("Runs per day: " + rpd + " times");
        logger.info("Cost per day: " + cpd + "GC");

        let balance = $ms.accts.balance();
        logger.info("Balance: " + balance + "GC");

        // Load the metrics into the brain - This should never returned an array
        let metrics = query<IndexMetrics>("f", {}, { __new_metrics: true }, 1) as IndexMetrics;
        let bots_active = metrics.brains.filter((e) => e.last_scan > new Date().getTime() - (3600 * 2));
        let bots_alive = bots_active.length;
        // let cost_per_day = 

        logger.info("Total bots: " + metrics.brains.length);
        logger.info("Alive bots: " + bots_alive);

        let after_run_balance = balance - triggerCost;

        if (after_run_balance < 0) {
            logger.warn("Balance would be negative after trigger - Sending funds");
            let xfer = $fs.accts.xfer_gc_to_caller({ amount: triggerCost, memo: "Bot Brain - Trigger Cost" });
            if (xfer.ok) logger.info("Funds sent");
            else logger.error("An error occurred while sending funds");
        } else {
            logger.info("Balance would be positive after trigger");
        }

        let stored_sectors = query<StoredSector[]>("f", {}, { __new_metrics: true }, 1) as StoredSector[];

        let sectors =
            $fs.scripts.fullsec().concat(
                $fs.scripts.highsec(),
                $fs.scripts.midsec(),
                $fs.scripts.lowsec(),
                $fs.scripts.nullsec()
            );

        let count = sectors.length;

        for (const sector of sectors) {
            let db_sector: StoredSector = {
                name: sector,
                last_indexed: new Date().getTime(),
                indexed_by: serial_number,
                __sector: true
            }
            stored_sectors.push(db_sector);
        }

        // query("i", {}, stored_sectors);

        logger.info("Active Sectors: " + count);
        logger.info("Queued Sectors: " + sectors.length);

        return logger.finalize();
    } catch (e) {

        return {
            ok: false,
            started: _START,
            ended: Date.now(),
            error: e.message,
            stack: e.stack,
            line: e.stack.split("\n")[0].split(":")[1]
        };
    }
}


