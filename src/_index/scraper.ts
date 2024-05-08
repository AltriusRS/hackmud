/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * CAUTION: EARLY ACCESS
 */
export default (context: Context, args: { mspt: number }) => {
    // allow the user to override the default number of sectors per trigger
    if (!args) args = { mspt: 5 };
    const MAX_SECTORS_PER_TRIGGER = args.mspt;


    // get the queue
    let queue = query_db("f", {}, { key: "bot_queue" })[0] as { _id: unknown, key: string, sectors: any[] };

    // Fetch all sectors from the server and add the missing ones to the queue
    let levels: [string, string[]][] = [];

    levels[0] = ["nullsec", $fs.scripts.nullsec()];
    levels[1] = ["lowsec", $fs.scripts.lowsec()];
    levels[2] = ["midsec", $fs.scripts.midsec()];
    levels[3] = ["highsec", $fs.scripts.highsec()];
    levels[4] = ["fullsec", $fs.scripts.fullsec()];
    let sectors_added = 0;
    let _metrics = query_db("f", {}, { __metrics: true })[0] as any;

    // for each level, add all the sectors to the queue if they are not already in there
    for (let i = 0; i < levels.length; i++) {
        let [level, sectors] = levels[i];

        // filter out sectors which are invalid
        sectors = sectors.filter((e) => /([A-Z]+_){2}\d/.exec(e));

        // add sectors to the queue only if they are not already in the queue
        sectors = sectors.filter((sector) => !queue.sectors.find((s) => s.sector === sector));
        sectors_added += sectors.length;

        queue.sectors = queue.sectors.concat(sectors.map((sector) => ({ level, sector })));
    }
    _metrics.sectors += sectors_added;

    $hs.chats.tell({ to: "altrius", msg: "Added " + sectors_added + " sectors" });


    // take the first MAX_SECTORS_PER_TRIGGER from the queue
    let thisRun = queue.sectors.slice(0, MAX_SECTORS_PER_TRIGGER).map((s) => {
        return {
            ...s,
            last_triggered: new Date(),
        }
    });
    let nextRun = queue.sectors.slice(MAX_SECTORS_PER_TRIGGER + 1);
    queue.sectors = [].concat(nextRun, thisRun);
    query_db("us", { key: "bot_queue" }, {
        $set: queue as any,
    });

    for (let i = 0; i < thisRun.length; i++) {
        let scripts = [];
        let { sector, level } = thisRun[i];
        $ms.chats.join({ channel: sector });
        switch (level) {
            case "nullsec":
                scripts = $fs.scripts.nullsec({ sector });
                break;
            case "lowsec":
                scripts = $fs.scripts.lowsec({ sector });
                break;
            case "midsec":
                scripts = $fs.scripts.midsec({ sector });
                break;
            case "highsec":
                scripts = $fs.scripts.highsec({ sector });
                break;
            case "fullsec":
                scripts = $fs.scripts.fullsec({ sector });
                break;
        }
        $ms.chats.leave({ channel: sector });

        for (let j = 0; j < scripts.length; j++) {
            let script = scripts[j];
            // $D("Adding script " + script + " to " + sector + " with level " + level);
            query_db("us", {
                $set: {
                    __script: true,
                    ikey: script.replaceAll(".", "#"),
                    title: script,
                    level,
                    sector,
                    z: new Date().getTime(),
                },
            }, { __script: true, ikey: script.replaceAll(".", "#") });
        }
    }

    let total = query_db("c", {}, { __script: true });

    $hs.chats.tell({ to: "altrius", msg: "I'm finished" });
    return { ok: true, scripts: total, sectors: queue.sectors.length };
}

function query_db(operand: string, command: unknown, query: unknown): unknown {
    let response = $fs.fatalcenturion.db({ operand, command, query })
    return response.q
}