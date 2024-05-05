/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * CAUTION: EARLY ACCESS
 */
export default (context: Context, args: unknown) => {
    const MAX_SECTORS_PER_TRIGGER = 9;
    $hs.chats.tell({ to: "altrius", msg: "I'm working" });

    // let levels: [string, string[]][] = [];

    // levels[0] = ["nullsec", $fs.scripts.nullsec()];
    // levels[1] = ["lowsec", $fs.scripts.lowsec()];
    // levels[2] = ["midsec", $fs.scripts.midsec()];
    // levels[3] = ["highsec", $fs.scripts.highsec()];
    // levels[4] = ["fullsec", $fs.scripts.fullsec()];

    // let queue = {
    //     key: "bot_queue",
    //     sectors: [],
    //     last_triggered: new Date(),
    // }

    // for (let i = 0; i < levels.length; i++) {
    //     let [level, sectors] = levels[i];
    //     queue.sectors = queue.sectors.concat(sectors.filter(/([A-Z]+_){2}\d/.exec).map((sector) => ({ level, sector })));
    // }
    // $db.us({ key: "bot_queue" }, {
    //     $set: queue,
    // });

    let query = $db.f({ key: "bot_queue" }).first_and_close() as { _id: unknown, key: string, sectors: any[] };


    // take the first MAX_SECTORS_PER_TRIGGER from the queue
    let thisRun = query.sectors.slice(0, MAX_SECTORS_PER_TRIGGER).map((s) => {
        return {
            ...s,
            last_triggered: new Date(),
        }
    });
    let nextRun = query.sectors.slice(MAX_SECTORS_PER_TRIGGER + 1);
    query.sectors = [].concat(nextRun, thisRun);
    $db.us({ key: "bot_queue" }, {
        $set: query as any,
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
                z: new Date(),
            },
        });
    }

    $hs.chats.tell({ to: "altrius", msg: "I'm finished" });
    return { ok: true, msg: "[Bot Brain] complete" };
}