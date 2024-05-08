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
const ad_rate = 1_000 * 60 * 30; // Send an ad every 30 minutes
const ads_channel = "0000";

const scam_alerts_enabled = false;
const scam_alert_channel = "findr_testing";


const TRUST = JSON5.parse(fs.readFileSync("./src/trust.json", "utf8"));
const INTERNAL = JSON5.parse(fs.readFileSync("./src/whitelist.json", "utf8"));

const whitelist = new Set([].concat(TRUST, INTERNAL));

const cooldowns = new Map();

const footer = [
    "",
    "`YFound a scam? Report it using`",
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