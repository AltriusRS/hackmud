const { HackmudApi, ChannelMessage, Message, Channel } = require("hackmud-chat");
// var HackmudChatAPI = require("@com1killer/hackmud-chat-api");
const { MongoClient } = require('mongodb');
require("dotenv").config();
// var chat = new HackmudChatAPI(process.env.TOKEN);
const client = new MongoClient(process.env.MONGO_URI);
const fs = require("fs");
const JSON5 = require("json5");

const COOLDOWN = 1000 * 60 * 5; // Cooldown 5 minutes per dangerous script

const enable_ads = true;
const ad_rate = 1_000 * 60 * 15; // Send an ad every 5 minutes
const ads_channel = "0000";

const scam_alerts_enabled = false;
const scam_alert_channel = "findr_testing";


const TRUST = {
    "accts.balance": { trusted: true },
    "accts.balance_of_owner": { trusted: true },
    "accts.transactions": { trusted: true },
    "accts.xfer_gc_to": { trusted: true },
    "accts.xfer_gc_to_caller": { trusted: true },
    "autos.reset": { trusted: true },
    "chats.channels": { trusted: true },
    "chats.create": { trusted: true },
    "chats.join": { trusted: true },
    "chats.leave": { trusted: true },
    "chats.send": { trusted: true },
    "chats.tell": { trusted: true },
    "chats.users": { trusted: true },
    "corps.create": { trusted: true },
    "corps.hire": { trusted: true },
    "corps.manage": { trusted: true },
    "corps.offers": { trusted: true },
    "corps.quit": { trusted: true },
    "corps.top": { trusted: true },
    "escrow.charge": { trusted: true },
    "escrow.confirm": { trusted: true },
    "escrow.stats": { trusted: true },
    "gui.chats": { trusted: true },
    "gui.quiet": { trusted: true },
    "gui.size": { trusted: true },
    "gui.vfx": { trusted: true },
    "gui.vol": { trusted: true },
    "kernel.hardline": { trusted: true },
    "market.browse": { trusted: true },
    "market.buy": { trusted: true },
    "market.sell": { trusted: true },
    "market.stats": { trusted: true },
    "scripts.fullsec": { trusted: true },
    "scripts.get_access_level": { trusted: true },
    "scripts.get_level": { trusted: true },
    "scripts.highsec": { trusted: true },
    "scripts.lowsec": { trusted: true },
    "scripts.midsec": { trusted: true },
    "scripts.nullsec": { trusted: true },
    "scripts.quine": { trusted: true },
    "scripts.sys": { trusted: true },
    "scripts.trust": { trusted: true },
    "scripts.user": { trusted: true },
    "sys.access_log": { trusted: true },
    "sys.breach": { trusted: true },
    "sys.cull": { trusted: true },
    "sys.init": { trusted: true },
    "sys.loc": { trusted: true },
    "sys.manage": { trusted: true },
    "sys.specs": { trusted: true },
    "sys.status": { trusted: true },
    "sys.upgrade_log": { trusted: true },
    "sys.upgrades": { trusted: true },
    "sys.upgrades_of_owner": { trusted: true },
    "sys.xfer_upgrade_to": { trusted: true },
    "sys.xfer_upgrade_to_caller": { trusted: true },
    "trust.me": { trusted: true },
    "users.active": { trusted: true },
    "users.config": { trusted: true },
    "users.inspect": { trusted: true },
    "users.last_action": { trusted: true },
    "users.top": { trusted: true },
}

const whitelist = new Set();
whitelist.add("altrius#findr");
whitelist.add("altrius#donate");
whitelist.add("findr#r");
whitelist.add("findr#donate");
Object.keys(TRUST).forEach(k => whitelist.add(k));

const cooldowns = new Map();

const footer = [
    "",
    "Found a scam? Report it using",
    "find.r {report: \"some.script\"}",
    "         `LAlways FULLSEC`",
    "`YScript Reports - Powered by Findr`",
    "     `YIn Search of Better`",
    ""
]





main();

async function main() {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("hackmud");
    const collection = db.collection("findr");



    const hackmud = new HackmudApi(process.env.TOKEN);
    // await client.getToken("pass"); // otherwise get the token using the pass
    const account = await hackmud.getAccountData();
    const user = account.getUserByName("find");

    const adChannel = user.channels.filter(c => c.name === ads_channel)[0];
    const scamAlertChannel = user.channels.filter(c => c.name === scam_alert_channel)[0];

    console.log("Connecting to chat");
    console.log("Logged in as", user.name)
    if (enable_ads) {
        console.log("Ads Enabled");
        adChannel.send(getRandomAdvert());
        setInterval(() => {
            console.log("Sending ad");
            adChannel.send(getRandomAdvert())
        }, ad_rate);
    }


    account.poll(async (messages) => {
        messages.forEach(async (message) => {
            if (message.isOwnMessage()) return;

            // Extract the scripts from the message
            let contains_script = /([a-z]{1}[0-9a-z_]*\.[a-z]{1}[0-9a-z_]*)/ig.exec(message.msg);

            // If the message doesn't contain a script, skip it
            if (!contains_script) return;
            // Extract the scripts and remove duplicates
            let scripts = contains_script.filter((v, i, a) => a.indexOf(v) === i).map(s => ({ name: s.toLowerCase(), ikey: s.replace(/\./g, "#").toLowerCase() }));

            let search = await collection.find({ ikey: { $in: scripts.map(s => s.ikey) } }).toArray();

            // if (pm && message.to_user === "altrius" && message.msg.startsWith("findr-rep")) {
            //     let [, ikey, caller, z] = message.msg.split(" ");

            //     if (search.length === 0) {
            //         await collection.insertOne({
            //             ikey: ikey,
            //             z: parseInt(z),
            //             tags: [],
            //             reports: [{}],
            //             source: "chat",
            //         });
            //     } else {
            //         let manifest = search[0];
            //         if (manifest.reports.length > 0) {
            //             let report = manifest.reports[0];
            //             if (report.victim === caller) {
            //                 await collection.updateOne({ ikey: ikey }, { $set: { reports: manifest.reports } });
            //             }
            //         } else {
            //             await collection.updateOne({ ikey: ikey }, { $set: { reports: [{}] } });
            //         }
            //     }
            // } else {
            if (search.length === 0) {
                await collection.insertOne({
                    ikey: scripts[0].ikey,
                    z: new Date().getTime(),
                    tags: [],
                    reports: [],
                    source: "chat",
                });
            }

            try {
                if (!scam_alerts_enabled) return;
                let scams = search.filter(s => () => {
                    console.log(s.reports);
                    return s.reports.length > 0;
                });

                // Filter out whitelisted scripts
                scams = scams.filter(s => !whitelist.has(s.ikey));

                // Filter out scripts that are on cooldown
                scams = scams.filter(s => {
                    if (cooldowns.has(s.ikey))
                        return cooldowns.get(s.ikey) > new Date().getTime();
                    return true;
                })

                // Limit the number of scams to 3
                // This prevents spam and keeps the bot 
                // from getting timed out by the API
                if (scams.length > 3) {
                    scams.length = 3;
                }

                // If there are no scams, skip
                if (scams.length == 0) return;

                // Set cooldowns for scripts that remain
                scams.map(s => cooldowns.set(s.ikey, new Date().getTime() + COOLDOWN));

                let text = [
                    "\n",
                    "`DCAUTION POSSIBLE SCAMS DETECTED`",
                    scams.map(s => `\`8${s.ikey.replace(/#/g, ".")}: ${s.reports.length} reports in the last 24 hours\``).join("\n"),
                ]
                scamAlertChannel.send(text.join("\n"))
                scamAlertChannel.send(footer.join("\n"))

            } catch (e) {
                console.log("Failed to send scam alart");
            };
        });
    }, 2_000);
}


function getRandomAdvert() {
    let ads = JSON5.parse(fs.readFileSync("./src/ads.json", "utf8"));
    return ads[Math.floor(Math.random() * ads.length)].join("\n")
}