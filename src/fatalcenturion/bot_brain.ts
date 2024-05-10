/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * CAUTION: EARLY ACCESS
 */
export default (context: Context, args: {}) => {
  const _START = Date.now();
  // get the queue
  const queue = $db.f({ key: "bot_queue" }).first_and_close() as { _id: unknown, key: string, sectors: any[] };

  // Fetch all sectors from the server and add the missing ones to the queue
  const levels: [string, string[]][] = [];

  levels[0] = ["nullsec", $fs.scripts.nullsec()];
  levels[1] = ["lowsec", $fs.scripts.lowsec()];
  levels[2] = ["midsec", $fs.scripts.midsec()];
  levels[3] = ["highsec", $fs.scripts.highsec()];
  levels[4] = ["fullsec", $fs.scripts.fullsec()];
  let sectors_added = 0;
  const _metrics = $db.f({ __metrics: true }).first_and_close() as any;

  // for each level, add all the sectors to the queue if they are not already in there
  for (let i = 0; i < levels.length; i++) {
    let [level, sectors] = levels[i];

    // filter out sectors which are invalid
    // sectors = sectors.filter((e) => /([A-Z]+_){2}\d/.exec(e));

    // add sectors to the queue only if they are not already in the queue
    sectors = sectors.filter((sector) => !queue.sectors.find((s) => s.sector === sector));
    sectors_added += sectors.length;

    queue.sectors = queue.sectors.concat(sectors.map((sector) => ({ level, sector })));
  }
  _metrics.sectors += sectors_added;

  let scripts_added = 0;
  let sectors_scanned = 0;

  for (let i = 0; i < queue.sectors.length; i++) {
    if (Date.now() - _START > 4200) break;
    const s = queue.sectors.shift();
    s.last_triggered = new Date();
    queue.sectors.push(s);
    sectors_scanned++;
    let scripts = [];
    const { sector, level } = s;
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
      const script = scripts[j];

      const manifest = $db.f({ __script: true, ikey: script.replaceAll(".", "#") }).first_and_close();
      if (!manifest) scripts_added++;
      $db.us({ __script: true, ikey: script.replaceAll(".", "#") }, {
        $set: {
          __script: true,
          ikey: script.replaceAll(".", "#"),
          author: script.split('.')[0],
          title: script,
          level,
          sector,
          z: new Date().getTime(),
        },
      });
    }
  }

  const total = $db.f({ __script: true }).count_and_close();
  _metrics.scripts = total;

  $db.u1({ key: "bot_queue" }, {
    $set: queue as any,
  });

  if (!_metrics.sectors_scanned) _metrics.sectors_scanned = [];
  if (_metrics.sectors_scanned.length > (96)) _metrics.sectors_scanned.shift();
  _metrics.sectors_scanned.push(sectors_scanned);

  $db.u1({ __metrics: true }, {
    $set: {
      scripts: total,
      sectors: queue.sectors.length,
      last_scan: new Date().getTime(),
      bot_gc: $fs.accts.balance_of_owner(),
      sectors_scanned: _metrics.sectors_scanned,
    }
  });

  $fs.chats.tell({ to: "altrius", msg: "Added " + sectors_added + " sectors\nAdded " + scripts_added + " scripts\nScanned " + sectors_scanned + " sectors\nI'm finished" });
  return { ok: true, msg: "Added " + sectors_added + " sectors\nAdded " + scripts_added + " scripts\nScanned " + sectors_scanned + " sectors\n[Bot Brain] complete" };
}
