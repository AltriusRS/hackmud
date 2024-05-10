/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * @caution EARLY ACCESS
 * @level FULLSEC
 */

// @autocomplete {name: "some.script", report: "some.script", user: "username", publics: false, prefix: "some_prefix", postfix: "some_postfix", regex: "/[a-z0-9_\.]*/", showStale: false, source: false, name: "script.name", level: "fullsec", sector: "CHAOS_LAMBDA_3"
export default (context: Context, args: {
	tags?: string | string[], // The tags to add to the script (comma separated)
	tag?: string,             // The script to tag
	name?: string,   		  // The name of the script to search for
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
  var START_STACK = new Error();
  try {
	const end = () => {
		let log = l.get_log().join("\n").replaceAll('"', '')
		// $D(log)
		log = log.split("\\n").join("\n");
		// $D(log)
		return log
	}
	// Preload the stdlib
	const l = $fs.scripts.lib()

	l.log("`5:::::::::: ::::::::::: ::::    ::: :::::::::  :::::::::  `"
		+ "\n`f:+:            :+:     :+:+:   :+: :+:    :+: :+:    :+: `"
		+ "\n`g+:+            +:+     :+:+:+  +:+ +:+    +:+ +:+    +:+ `"
		+ "\n`o:#::+::#       +#+     +#+ +:+ +#+ +#+    +:+ +#++:++#:  `"
		+ "\n`n+#+            +#+     +#+  +#+#+# +#+    +#+ +#+    +#+ `"
		+ "\n`p#+#            #+#     #+#   #+#+# #+#    #+# #+#    #+# `"
		+ "\n`3###        ########### ###    #### #########  ###    ### `"
		+ "\n`NWritten by Altrius``8     EARLY    ACCESS     ``YVersion 0.2.1 `"
		+ "\n`8                       ‾‾‾‾‾‾‾‾    ‾‾‾‾‾‾‾‾‾‾‾`");

	let is_valid = true

	if (args) {
		let filters = Object.keys(args)
		let invalids = filters.filter((e) => !["limit", "page", "gibson", "corpsOnly", "description", "usage", "metrics", "user", "open", "tag", "tags", "name", "report", "showStale", "level", "sector", "publics", "prefix", "postfix", "regex"].includes(e))
		if (invalids.length > 0) {
			invalids.map((e) => l.log(`\`DInvalid argument: ${e}\``))
			is_valid = false
		} else if (filters.length === 0) is_valid = false
	} else is_valid = false

	// If no arguments are provided, print a help message
	if (!is_valid) {
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
		return end()
	}

	const ikey = (args.tag || args.report || args.name || "").replace(".", "#");

	if (args.user) args.prefix = args.user + ".";

	if (args.tag || args.report || args.metrics || args.open || args.description || args.usage) {
		let op = args.tag ? "tag" :
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

	let instant = new Date().getTime();
	// Query the db for the sector

	let filter = { __script: true } as any
	let stale_time = new Date().getTime() - 4_3200_000;
	let { corps } = query_db("f", {}, { __corpdata: true })[0];

	// Make these arguments mutually exclusive since they would override each other
	if (args.gibson) filter.ikey = { $regex: "^gibson#.*" };
	else if (args.name) filter.ikey = ikey;
	else if (args.user) filter.ikey = { $regex: `^${args.user}#.*` };
	else if (args.prefix) filter.ikey = { $regex: `^${args.prefix}.*` };
	else if (args.postfix) filter.ikey = { $regex: `.*${args.postfix}$` };
	else if (args.regex) filter.ikey = { $regex: args.regex };
	else if (args.publics) filter.ikey = { $regex: `.*#public$` };


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



	let response = query_db("f", {}, filter, args.limit, undefined, args.page) as any[];
	let matches = query_db("c", {}, filter) as number;
	let total_pages = Math.ceil(matches / args.limit);
	let next_page = args.page + 1;

	let _metrics = query_db("f", {}, { __metrics: true })[0];

	let sector_count = { filtered: 0, total: _metrics.sectors };
	let script_count = { filtered: 0, total: _metrics.scripts };
	let sec_count = [];
	let sectors = {}
	let script_index = 0;
	let longest_script_name = 0

	for (let i = 0; i < response.length; i++) {
		let script = response[i];
		let sector = sectors[script.sector];
		script_count.total++;

		if (args.corpsOnly && !corps.includes((script.ikey || "").split("#")[0])) continue;
		if (!sec_count.includes(script.sector)) {
			sec_count.push(script.sector)
			sector = sectors[script.sector] = [];
			sector_count.filtered++;
		}
		script_count.filtered++;
		if (script.ikey.length > longest_script_name) longest_script_name = script.ikey.length

		sector.push(script);
	}

	let sector_info = Object.keys(sectors).map((e) => ({ sector: e, scripts: sectors[e] }));
	for (let i = 0; i < sector_info.length; i++) {
		let sector = sector_info[i];
		let sec_level = "UNKNOWN";
		switch (sector.scripts[0].level.toLowerCase()) {
			case "fullsec":
				sec_level = `\`2FULLSEC\``
				break;
			case "highsec":
				sec_level = `\`HHIGHSEC\``
				break;
			case "midsec":
				sec_level = `\`5MIDSEC \``
				break;
			case "lowsec":
				sec_level = `\`DLOWSEC \``
				break;
			case "nullsec":
				sec_level = `\`VNULLSEC\``
				break;
		}

		if (sector_info.length === 1 && sector.scripts.length === 1) {
			let script = sector.scripts[0];
			let name = script.ikey.replace("#", ".");
			let tag_string = script.tags.length > 0 ? script.tags.map((e) => e.split(" ").map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(" ")).join(", ") : "No Tags";
			let report_str = script.reports.length > 0 ? script.reports.length > 1 ? `\`E${script.reports.length} Scam Reports\``
				: `\`E${script.reports.length} Scam Report\``
				: "No Scams Reported";

			l.log(
				`Name:                ${name}\n`
				+ `Author:              ${name.split(".")[0]}\n`
				+ `Sector:              ${script.sector}\n`
				+ `Level:               ${sec_level}\n`
				+ `Tags:                ${tag_string}\n`
				+ `Reports:             ${script.level === "fullsec" ? "Not Applicable" : (report_str + " in the last 24 hours")}\n`
				+ `Script last indexed: \`8${get_hhmmss(new Date().getTime() - script.z)}\` ago\n`
				+ `Usage:               ${script.usage || "Unknown"}\n`
				+ `Open source:         ${script.open ? "\`2Yes\`" : "\`DNo\`"}\n`
				+ `Source URL:          ${script.open ? "Source: " + script.open : "N/A"}\n`
				+ `Description:\n`
				+ `${script.description || "No description provided"}\n`

			)

			if (context.caller === name.split(".")[0]) {
				l.log("`YYou are the author of this script`\n"
					+ "`7If you wish to modify the listing, please contact ``G@altrius_codes``8 on discord`\n"
					+ "`7If your script is open source, please send me a link to the code, so I may add it to the database`\n"
					+ "`7Please understand that scam reports will not be modified unless proof of abuse is provided`"
				)
			}
		}

		for (let j = 0; j < sector.scripts.length; j++) {
			let script = sector.scripts[j]
			if (!script.reports) script.reports = [];
			if (!script.tags) script.tags = [];

			let name = script.ikey.replace("#", ".");
			// join and capitalize the first letter of each word
			let tag_string = script.tags.length > 0 ? script.tags.map((e) => e.split(" ").map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(" ")).join(", ") : "No Tags";
			let report_str = script.reports.length > 0 ? script.reports.length > 1 ? `\`E${script.reports.length} Scam Reports\``
				: `\`E${script.reports.length} Scam Report\``
				: "No Scams Reported";

			// If there is only one script returned by the query, show the detailed information view
			if (args.name || sector.scripts.length === 1 && sector_info.length === 1) {

			} else {
				if (script.is_stale)
					l.log(`\`4${pad((script_index += 1) + "", 4, 0)} - ${pad(name, longest_script_name, 1)}\`\`4 | \`${sec_level}\`4 | \`\`ISTALE\`\`4 | \`${script.sec_level === "fullsec" ? " Not  Applicable " : report_str}\`4 | \`\`8${tag_string}\``);
				else
					l.log(`\`4${pad((script_index += 1) + "", 4, 0)} - ${pad(name, longest_script_name, 1)}\`\`4 | \`${sec_level}\`4 | \`\`Y     \`\`4 | \`${script.sec_level === "fullsec" ? " Not  Applicable " : report_str}\`4 | \`\`8${tag_string}\``);
			}

		}
	}

	let duration = new Date().getTime() - instant;
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
	let donations = query_db("f", {}, { __donation: true }, 5, { amount: -1 }) as any[];
	if (donations) {
		l.log(`\n\`6Thank you to the following donors:\``)
		let donor_list = donations.map((d) => d.user)
		let donor_amount = donations.map((d) => d.amount.toLocaleString())
		let donor_name_length = Math.max(...donor_list.map((d) => d.length))
		let donor_amount_length = Math.max(...donor_amount.map((d) => d.length))

		donations.map((d) => l.log(`\n\`6${pad(d.user, donor_name_length, 1)} -\` \`Y${pad(d.amount.toLocaleString().split(",").join("`,`Y"), donor_amount_length, 1)}GC\``))
	}
	l.log("");
	l.log("`YThank you to our donors for funding the project.`")
	l.log("`YYour donation is being used for the good of the community!`")
	$fs.chats.send({
		channel: "findr_testing",
		msg: `\n` +
			`I just used find.r to search for something!\n` +
			`Found: ${script_count.filtered} scripts.\n` +
			`Across ${sector_count.filtered} sectors.\n` +
			`Did you know that you can report scams now?\n` +
			`find.r {report: "some.script"}\n` +
			"`YFindr - In Search of Better`"
	})
	return end()
  } catch (e) {
    return {
      ok: false,
      start: START_STACK.stack,
      now: e.stack,
      message: e.message
    }
  }
}

function get_hhmmss(time: number) {
	time = time / 1000;
	let hours = Math.floor(time / 3600);
	time -= hours * 3600;
	let minutes = Math.floor(time / 60);
	time -= minutes * 60;
	let seconds = Math.floor(time);
	return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}

function query_db(operand: string, command: unknown, query: unknown, limit?: number, sort?: unknown, page?: number): unknown {
	let response = $fs.fatalcenturion.db({ operand, command, query, limit, sort, page })
	return response.q
}

function pad(str: string, length: number, alignment: number = 0): string {
	let pad = "";
	for (let i = 0; i < length - str.length; i++) alignment === 0 ? pad += " " : pad = " " + pad;
	return pad + str;
}
