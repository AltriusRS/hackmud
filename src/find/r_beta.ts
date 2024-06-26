/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * @caution EARLY ACCESS
 * @level FULLSEC
 * @autocomplete {name: "some.script", report: "some.script", user: "username", publics: false, prefix: "some_prefix", postfix: "some_postfix", regex: "[a-z0-9_\.]*", showStale: false, source: false, name: "script.name", level: "fullsec", sector: "CHAOS_LAMBDA_3" * @
*/

import { db, str, time, log, quabble } from "../lib";
import { IKey } from "../lib/str";
import { IndexMetrics, Script, Sector, SecurityLevel, SecurityLevels, StoredScript, securityLevels } from "../lib/types";

export default (context: Context, args: {
  tags?: string | string[], // The tags to add to the script (comma separated)
  tag?: string,             // The script to tag
  name?: string,   		      // The name of the script to search for
  report?: string,          // Allows someone to report a scam script
  level?: string,           // The level to search for
  sector?: string,          // The sector to search for
  target?: string,   	      // The target to search for
  publics?: boolean,        // Whether to show only scripts ending in .public
  prefix?: string,          // The prefix to search for
  postfix?: string,         // The postfix to search for
  regex?: string,           // A regular expression to search for
  showStale?: boolean,      // Whether to show results which are considered stale (IE: those over 12 hours old)
  source?: boolean,         // Whether to show the source code of the findr script
  metrics?: boolean,        // Whether to show the metrics
  open?: string,            // Mark the target script as open (takes a url)
  user?: string,            // The user to search for
  usage?: string,           // Add usage to a script
  description?: string,     // Add a description to a script
  corpsOnly?: boolean,      // Only show scripts which are known to be npc corps
  gibson?: boolean,         // Only show gibson scripts
  limit?: number,           // The number of results to show
  page?: number,            // The page to show
}) => {
  const START_STACK = new Error();
  try {
    // Preload the stdlib
    const l = $fs.scripts.lib()

    l.log("`5:::::::::: ::::::::::: ::::    ::: :::::::::  :::::::::  `"
      + "\n`f:+:            :+:     :+:+:   :+: :+:    :+: :+:    :+: `"
      + "\n`g+:+            +:+     :+:+:+  +:+ +:+    +:+ +:+    +:+ `"
      + "\n`o:#::+::#       +#+     +#+ +:+ +#+ +#+    +:+ +#++:++#:  `"
      + "\n`n+#+            +#+     +#+  +#+#+# +#+    +#+ +#+    +#+ `"
      + "\n`p#+#            #+#     #+#   #+#+# #+#    #+# #+#    #+# `"
      + "\n`3###        ########### ###    #### #########  ###    ### `"
      + "\n`NWritten by Altrius`                         `YVersion 1.0.0 `" +
      + "\n");

    let [is_valid, error_messages] = quabble.validate(args, ["limit", "page", "gibson", "corpsOnly", "description", "usage", "metrics", "user", "open", "tag", "tags", "name", "report", "showStale", "level", "sector", "publics", "prefix", "postfix", "regex"]);



    // If no arguments are provided, print a help message
    if (!is_valid) {
      error_messages.map(l.log);
      l.log(""
        + `\nMeet ${context.this_script}`
        + "\nThe always free script finder!"
        + `\n\`DScammed by a script? Report the script to us with the argument\` { report: '<script_name>' }`
        + "\nTo get started, use the arguments below to find scripts you might be interested in"
        + "\n- `2showStale`   - Show results which are considered stale (IE: those over 12 hours old)"
        + "\n- `2name`        - The name of the script to search for"
        + "\n- `2tags`        - Filter results by specific tags"
        + "\n- `2level`       - The security level to search within"
        + "\n- `2sector`      - The sector to search within"
        + "\n- `2user`        - Searches for scripts created by the given user"
        + "\n              > This is an alias for `2prefix`"
        + "\n- `2publics`     - Whether to show only scripts ending in `2.public`"
        + "\n- `2corpsOnly`   - Only show scripts which are known to be npc corps"
        + "\n- `2prefix`      - The prefix to search for"
        + "\n              > For example, to find all scripts starting in `2wiz.`, use the argument `2wiz.`"
        + "\n- `2postfix`     - The postfix to search for"
        + "\n              > For example, to find all scripts ending in `2.bank`, use the argument `2.bank`"
        + "\n- `2regex`       - A regular expression to search for"
        + "\n              > play around with the regex tester at https:\/\/regex101.com\/"
        + "\n              > For example, to find all scripts containing a number use the argument `2[0-9]`"
        + "\n- `2gibson`   - Show only the gibson scripts"
        + "\n- `2limit`       - The number of results to show (defaults to 20)"
        + "\n- `2page`        - The page to show (defaults to 1)"
        + "\n"
        + "\n`5ORDER OF EXECUTION:`"
        + "\n`5- The order of execution is as listed above`"
        + "\n"
        + "\nIf you wish to verify the source code of this script. You may find it at "
        + "\n`4Donations: ``3https:\/\/git\.archimedia\.uk\/altrius\/hackmud\/`"
        + `\nDue to space constraints, this script is obfuscated in game.`)
      return log.end()
    }

    const ikey = new IKey(args.tag || args.report || args.name || "");

    if (args.user) args.prefix = args.user + ".";

    if (args.tag || args.report || args.metrics || args.open || args.description || args.usage) {
      const op = args.tag ? "tag" :
        args.metrics ? "metrics" :
          args.report ? "report" :
            args.open ? "open" :
              args.description ? "description" : "usage"

      return $fs.find.lib_modify({
        op,
        passthrough: {
          ikey,
          tags: args.tags,
          url: args.open,
          description: args.description,
          usage: args.usage,
          regex: args.regex
        }
      })
    }

    if (args.level) args.level = args.level.toLowerCase()

    const instant = new Date().getTime();
    // Query the db for the sector

    const filter = { __script: true } as any
    const stale_time = new Date().getTime() - 4_3200_000;
    const { corps } = db.query("f", {}, { __corpdata: true })[0];

    // Make these arguments mutually exclusive since they would override each other
    if (args.gibson) filter.ikey = { $regex: "^gibson#.*" };
    else if (args.name) filter.ikey = ikey;
    else if (args.user) filter.ikey = { $regex: `^${args.user}#.*` };
    else if (args.prefix) filter.ikey = { $regex: `^${args.prefix}.*` };
    else if (args.postfix) filter.ikey = { $regex: `.*${args.postfix}$` };
    else if (args.regex) filter.ikey = { $regex: args.regex };
    else if (args.publics) filter.ikey = { $regex: `.*#public$` };

    if (args.corpsOnly) filter.author = { $in: corps }


    if (args.level) filter.level = args.level.toLowerCase();
    if (args.sector) filter.sector = args.sector;

    if (args.showStale) filter.z = { $lte: stale_time };
    if (args.tags) filter.tags = { $in: args.tags };

    if (args.limit > 100) {
      args.limit = 100
      l.log("[`DWARNING`] The argument '`Nlimit`' cannot be more than 100")
      l.log("[ `4INFO`  ] For more results, use the argument `Npage` to view the next page")
    }
    if (args.limit < 1) {
      args.limit = 20
      l.log("[`DWARNING`] The argument '`Nlimit`' cannot be less than 1")
    }
    if (!args.limit) args.limit = 20
    if (!args.page) args.page = 1



    const response: StoredScript[] = db.query("f", {}, filter, args.limit, undefined, args.page) as any[];
    const matches = db.query("c", {}, filter) as number;
    const total_pages = Math.ceil(matches / args.limit);
    const next_page = args.page + 1;

    const _metrics: IndexMetrics = db.query("f", {}, { __metrics: true })[0];

    const sector_count = { filtered: 0, total: _metrics.sectors };
    const script_count = { filtered: 0, total: _metrics.scripts };
    const sectors: { [key: string]: Sector } = {};
    let script_index = 0;
    let longest_script_name = 0

    for (let i = 0; i < response.length; i++) {
      const script = response[i];
      let sector = sectors[script.sector];
      script_count.total++;

      if (!sectors[script.sector]) {
        sectors[script.sector] = {
          sector: script.sector,
          scripts: [],
          level: SecurityLevel.fromDisplay(script.level ?? ""),
        }
        sector_count.filtered++;
        sector = sectors[script.sector];
      }
      script_count.filtered++;
      if (script.ikey.length > longest_script_name) longest_script_name = script.ikey.length

      sector.scripts.push(Script.fromDB(script));
    }

    const sector_info = Object.values(sectors)
    for (let i = 0; i < sector_info.length; i++) {
      const sector = sector_info[i];

      if (sector_info.length === 1 && sector.scripts.length === 1) {
        const script = sector.scripts[0]


        const tag_string = script.tags.length > 0 ? script.tags.map((e) => e.split(" ").map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(" ")).join(", ") : "No Tags";
        const report_str = script.level.value === 4 ? " Not  Applicable " : script.reports.length > 0 ? script.reports.length > 1 ? `\`E${script.reports.length} Scam Reports\``
          : `\`E${script.reports.length} Scam Report\``
          : "No Scams Reported";

        l.log(
          `Name:                ${script.name}\n`
          + `Author:              ${script.author}\n`
          + `Sector:              ${script.sector}\n`
          + `Level:               ${script.level}\n`
          + `Tags:                ${tag_string}\n`
          + `Reports:             ${script.level === securityLevels[4] ? "Not Applicable" : (report_str + " in the last 24 hours")}\n`
          + `Script last indexed: \`8${time.to_digital(new Date().getTime() - script.z)}\` ago\n`
          + `Usage:               ${script.usage || "Unknown"}\n`
          + `Open source:         ${script.open ? "\`2Yes\`" : "\`DNo\`"}\n`
          + `Source URL:          ${script.open ? "Source: " + script.open : "N/A"}\n`
          + `Description:\n`
          + `${script.description || "No description provided"}\n`

        )

        if (context.caller === script.author) {
          l.log("`YYou are the author of this script`\n"
            + "`7If you wish to modify the listing, please contact ``G@altrius_codes``8 on discord`\n"
            + "`7If your script is open source, please send me a link to the code, so I may add it to the database`\n"
            + "`7Please understand that scam reports will not be modified unless proof of abuse is provided`"
          )
        }
      } else {
        for (let j = 0; j < sector.scripts.length; j++) {
          const script = Object.assign({
            author: "uknown",
            sector: "uknown",
            level: "uknown",
            tags: [],
            reports: [],
            usage: "uknown",
            open: "uknown",
            description: "uknown"
          }, sector.scripts[j]);
          if (!script.reports) script.reports = [];
          if (!script.tags) script.tags = [];

          // join and capitalize the first letter of each word
          const tag_string = script.tags.length > 0 ? script.tags.map((e) => e.split(" ").map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(" ")).join(", ") : "No Tags";
          const report_str = script.reports.length > 0 ? script.reports.length > 1 ? `\`E${script.reports.length} Scam Reports\``
            : `\`E${script.reports.length} Scam Report\``
            : "No Scams Reported";

          // If there is only one script returned by the query, show the detailed information view
          if (args.name || sector.scripts.length === 1 && sector_info.length === 1) {

          } else {
            if (script.is_stale)
              l.log(`\`4${str.pad((script_index += 1) + "", 4, 0)} - ${str.pad(script.name, longest_script_name, 1)}\`\`4 | \`${script.level.toDisplay()}\`4 | \`\`ISTALE\`\`4 | \`${script.level === securityLevels[4] ? " Not  Applicable " : report_str}\`4 | \`\`8${tag_string}\``);
            else
              l.log(`\`4${str.pad((script_index += 1) + "", 4, 0)} - ${str.pad(script.name, longest_script_name, 1)}\`\`4 | \`${script.level.toDisplay()}\`4 | \`\`Y     \`\`4 | \`${script.level === securityLevels[4] ? " Not  Applicable " : report_str}\`4 | \`\`8${tag_string}\``);
          }

        }
      }
    }

    const duration = new Date().getTime() - instant;
    // If the next page is the last page, show a special message
    if (next_page > total_pages) l.log(`\n\`2Showing the last of ${total_pages} pages\``);
    else l.log(`\n\`2Showing page ${args.page} of ${total_pages}\` - \`Npage\`:${next_page} for more`);


    l.log(`\n\`YShowing ${sector_count.filtered} of ${sector_count.total} sectors\`\n`
      + `\`YShowing ${script_count.filtered} of ${script_count.total} scripts\`\n`
      + `\`YSearch took ${duration} milliseconds to complete\`\n`
      + `\nCan't find what you're looking for? Use the argument\n`
      + `{ showStale: true } to show results which are stale`)

    $fs.find.lib_modify({ op: "search", passthrough: { stats: { scripts: script_count.filtered, sectors: sector_count.filtered } } })

    /**
     * == SECTION: DONATIONS ==
     */
    l.log(`\n\`6Want to support my work? Feeling generous?\`\n\`6Use find.donate {donate:<amount>} to thank me!\``)

    // TODO dynamic donator list
    let donations = db.query("f", {}, { __donation: true, }, 10, { amount: -1 }) as any[];
    donations = donations.filter((d) => d.user !== "anonymous");
    donations.length = 5;
    if (donations) {
      l.log(`\n\`6Thank you to the following donors:\``)
      const donor_list = donations.map((d) => d.user)
      const donor_amount = donations.map((d) => d.amount.toLocaleString())
      const donor_name_length = Math.max(...donor_list.map((d) => d.length))
      const donor_amount_length = Math.max(...donor_amount.map((d) => d.length))

      donations.map((d) => l.log(`\n\`6${str.pad(d.user, donor_name_length, 1)} -\` \`Y${str.pad(d.amount.toLocaleString().split(",").join("`,`Y"), donor_amount_length, 1)}GC\``))
    }
    l.log("");
    l.log("`YThank you to our donors for funding the project.`")
    l.log("`YYour donation is being used for the good of the community!`")
    $fs.chats.send({
      channel: "0000",
      msg: `\n` +
        `I just used find.r to search for something!\n` +
        `Found: ${script_count.filtered} scripts.\n` +
        `Across ${sector_count.filtered} sectors.\n` +
        `Did you know that you can report scams now?\n` +
        `find.r {report: "some.script"}\n` +
        "`YFindr - In Search of Better`"
    })
    return log.end()
  } catch (e) {
    return {
      ok: false,
      start: START_STACK.stack,
      now: e.stack,
      message: e.message
    }
  }
}