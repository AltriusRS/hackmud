/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * CAUTION: EARLY ACCESS
 */
export default (context: Context, args: { mspt: number }) => {
    if (!args) args = { mspt: 9 };
    const MAX_SECTORS_PER_TRIGGER = args.mspt;
    $hs.chats.tell({ to: "altrius", msg: "I'm working" });
    let queue = $db.f({ key: "bot_queue" }).first_and_close() as { _id: unknown, key: string, sectors: any[] };

    let levels: [string, string[]][] = [];

    levels[0] = ["nullsec", $fs.scripts.nullsec()];
    levels[1] = ["lowsec", $fs.scripts.lowsec()];
    levels[2] = ["midsec", $fs.scripts.midsec()];
    levels[3] = ["highsec", $fs.scripts.highsec()];
    levels[4] = ["fullsec", $fs.scripts.fullsec()];


    // for each level, add all the sectors to the queue if they are not already in there
    for (let i = 0; i < levels.length; i++) {
        let [level, sectors] = levels[i];

        // filter out sectors which are invalid
        sectors = sectors.filter((e) => /([A-Z]+_){2}\d/.exec(e));

        // add sectors to the queue only if they are not already in the queue
        sectors = sectors.filter((sector) => !queue.sectors.find((s) => s.sector === sector));
        $hs.chats.tell({ to: "altrius", msg: "Added " + sectors.length + " " + level + " sectors" });

        queue.sectors = queue.sectors.concat(sectors.map((sector) => ({ level, sector })));
    }

    // take the first MAX_SECTORS_PER_TRIGGER from the queue
    let thisRun = queue.sectors.slice(0, MAX_SECTORS_PER_TRIGGER).map((s) => {
        return {
            ...s,
            last_triggered: new Date(),
        }
    });
    let nextRun = queue.sectors.slice(MAX_SECTORS_PER_TRIGGER + 1);
    queue.sectors = [].concat(nextRun, thisRun);
    $db.us({ key: "bot_queue" }, {
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
        $db.u1({ sector }, {
            $set: {
                level,
                scripts,
                z: new Date().getTime(),
            },
        });
    }

    $hs.chats.tell({ to: "altrius", msg: "I'm finished" });
    return { ok: true, msg: "[Bot Brain] complete" };
}