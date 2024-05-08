/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * @caution EARLY ACCESS
 * @level FULLSEC
 */

// @autocomplete {name: "some.script", report: "some.script", user: "username", publics: false, prefix: "some_prefix", postfix: "some_postfix", regex: "/[a-z0-9_\.]*/", showStale: false, source: false, name: "script.name", level: "fullsec", sector: "CHAOS_LAMBDA_3"
export default (context: Context, args: {
	tags?: string | string[], // The tags to add to the script (comma separated)
	tag?: string,   		  // The script to tag
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
}) => {
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
		+ "\n`NWritten by Altrius``8     EARLY    ACCESS     ``YVersion 0.1.5 `"
		+ "\n`8                       ‾‾‾‾‾‾‾‾    ‾‾‾‾‾‾‾‾‾‾‾`");

	let is_valid = true

	if (args) {
		let filters = Object.keys(args)
		let invalids = filters.filter((e) => !["metrics", "user", "open", "tag", "tags", "name", "report", "showStale", "level", "sector", "publics", "prefix", "postfix", "regex"].includes(e))
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
			+ "\n- `2level`       - The security level to search within"
			+ "\n- `2sector`      - The sector to search within"
			+ "\n- `2tags`        - An array of tags which you want to include in your search"
			+ "\n- `2publics`     - Whether to show only scripts ending in `2.public`"
			+ "\n- `2prefix`      - The prefix to search for"
			+ "\n              > For example, to find all scripts starting in `2wiz.`, use the argument `2wiz.`"
			+ "\n- `2postfix`     - The postfix to search for"
			+ "\n              > For example, to find all scripts ending in `2.bank`, use the argument `2.bank`"
			+ "\n- `2regex`       - A regular expression to search for"
			+ "\n              > play around with the regex tester at https:\/\/regex101.com\/"
			+ "\n              > For example, to find all scripts containing a number use the argument `2[0-9]`"
			+ "\n"
			+ "\n`5ORDER OF EXECUTION:`"
			+ "\n`5- The order of execution is as listed above`"
			+ "\n"
			+ "\nIf you wish to verify the source code of this script. You may find it at "
			+ "\nhttps:\/\/github\.com/altriusrs/hackmud/"
			+ `\nDue to space constraints, this script is obfuscated in game.`)
		return end()
	}

	const ikey = (args.tag || args.report || args.name || "").replace(".", "#");

	if (args.user) args.prefix = args.user + ".";

	if (args.tag || args.report || args.metrics || args.open) {
		let op = args.tag ? "tag" :
			args.metrics ? "metrics" :
				args.report ? "report" : "open"

		return $fs.find.lib_modify({
			op,
			passthrough: {
				ikey,
				tags: args.tags,
				url: args.open
			}
		})
	}

	if (args.level) args.level = args.level.toLowerCase()

	let instant = new Date().getTime();
	// Query the db for the sector
	let response = (args.name ? query_db("f", {}, { __script: true, ikey }) : query_db("f", {}, { __script: true, sector: args.sector, level: args.level })) as any[];
	let sector_count = { filtered: 0, total: 0 };
	let script_count = { filtered: 0, total: 0 };
	let sec_count = [];
	let sectors = {}
	let longest_script_name = 0

	let stale_time = new Date().getTime() - 4_3200_000;
	for (let i = 0; i < response.length; i++) {
		let script = response[i];
		let sector = sectors[script.sector];
		script_count.total++;

		if (!sec_count.includes(script.sector)) {
			sec_count.push(script.sector)
			sector_count.total++;
		}

		let filter_pass = true;
		if (args.publics && !script.ikey.endsWith("#public")) filter_pass = false;
		if (args.prefix && !script.ikey.startsWith(args.prefix)) filter_pass = false;
		if (args.postfix && !script.ikey.endsWith(args.postfix)) filter_pass = false;
		if (args.regex && !script.ikey.match(new RegExp(args.regex))) filter_pass = false;
		if (!args.showStale && script.z < stale_time) filter_pass = false;
		if (!filter_pass) continue;

		if (!sector) {
			sector = sectors[script.sector] = [];
			sector_count.filtered++;
		}

		if (!script.reports) script.reports = []
		if (!script.tags) script.tags = []
		if (script.z < stale_time) script.is_stale = true
		else script.is_stale = false
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

		for (let j = 0; j < sector.scripts.length; j++) {
			let script = sector.scripts[j]
			let name = script.ikey.replace("#", ".");
			// join and capitalize the first letter of each word
			let tag_string = script.tags.length > 0 ? script.tags.map((e) => e.split(" ").map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(" ")).join(", ") : "No Tags";
			let report_str = script.level === "fullsec" ? " Not  Applicable " :
				script.reports.length > 0 ? script.reports.length > 1 ? `\`E${script.reports.length} Scam Reports\``
					: `\`E${script.reports.length} Scam Report\``
					: "No Scams Reported";
			if (args.name) {
				l.log(
					`Name: ${name}\n`
					+ `Sector: ${script.sector}\n`
					+ `Level: ${sec_level}\n`
					+ `Tags: ${tag_string}\n`
					+ `Reports: ${report_str === "Not Applicable" ? report_str : report_str + " in the last 24 hours"}\n`
					+ `Script last indexed: \`8${get_hhmmss(new Date().getTime() - script.z)}\` ago\n`
					+ `Open source: ${script.open ? "\`2Yes\`" : "\`DNo\`"}\n`
					+ `${script.open ? "Source: " + script.open : ""}\n`
					+ `Author: ${name.split(".")[0]}\n`
				)

				if (context.caller === name.split(".")[0]) {
					l.log("`YYou are the author of this script`\n"
						+ "`7If you wish to modify the listing, please contact ``G@altrius_codes``8 on discord`\n"
						+ "`7If your script is open source, please send me a link to the code, so I may add it to the database`\n"
						+ "`7Please understand that scam reports will not be modified unless proof of abuse is provided`"
					)
				}
			} else {
				if (script.is_stale)
					l.log(`\`4${pad(j + 1 + "", 4, 0)} - ${pad(name, longest_script_name, 1)}\`\`4 | \`${sec_level}\`4 | \`\`ISTALE\`\`4 | \`${report_str}\`4 | \`\`8${tag_string}\``);
				else
					l.log(`\`4${pad(j + 1 + "", 4, 0)} - ${pad(name, longest_script_name, 1)}\`\`4 | \`${sec_level}\`4 | \`\`Y     \`\`4 | \`${report_str}\`4 | \`\`8${tag_string}\``);
			}

		}
	}

	let duration = new Date().getTime() - instant;
	l.log(`\n\`YShowing ${sector_count.filtered} of ${sector_count.total} sectors\`\n`
		+ `\`YShowing ${script_count.filtered} of ${script_count.total} scripts\`\n`
		+ `\`YSearch took ${duration} milliseconds to complete\`\n`
		+ `Can't find what you're looking for? Use the argument\n`
		+ `{ showStale: true } to show results which are stale`)

	$fs.find.lib_modify({ op: "search", passthrough: { stats: { scripts: script_count.filtered, sectors: sector_count.filtered } } })

	/**
	 * == SECTION: DONATIONS ==
	 */
	l.log(`\n\`6Want to support my work? Feeling generous?\`\n\`6Use find.donate {donate:<amount>} to thank me!\``)
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
	return end()
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

function query_db(operand: string, command: unknown, query: unknown): unknown {
	return $fs.fatalcenturion.db({ operand, command, query }).q
}

function pad(str: string, length: number, alignment: number = 0): string {
	let pad = "";
	for (let i = 0; i < length - str.length; i++) alignment === 0 ? pad += " " : pad = " " + pad;
	return pad + str;
}