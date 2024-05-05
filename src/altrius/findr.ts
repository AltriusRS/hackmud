/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * @caution EARLY ACCESS
 * @level FULLSEC
 */
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
		+ "\n`NWritten by Altrius``8     EARLY    ACCESS     ``YVersion 0.1.3 `"
		+ "\n`8                       ‾‾‾‾‾‾‾‾    ‾‾‾‾‾‾‾‾‾‾‾`");

	let is_valid = true

	if (args) {
		let filters = Object.keys(args)
		let invalids = filters.filter((e) => !["tag", "tags", "name", "report", "showStale", "level", "sector", "publics", "prefix", "postfix", "regex"].includes(e))
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

	if (args.tag && context.caller === "altrius") {
		const ikey = args.tag.replace(".", "#")
		let manifest = query_db("f", {}, { ikey })[0]

		let tags = (typeof args.tags === "string") ? args.tags.split(",").map((e) => e.trim()) : args.tags

		l.log("Script tagged, thank you")
		if (!manifest) {
			query_db("us", {
				$set: {
					__script: true,
					ikey,
					level: "unknown",
					sector: "unknown",
					tags,
					reports: [],
					z: new Date().getTime(),
				}
			}, { ikey })
		} else {
			query_db("u1", {
				$set: {
					tags,
					z: new Date().getTime(),
				}
			}, { ikey })
		}
		return end()
	}

	if (args.report) {
		const ikey = args.report.replace(".", "#")
		l.log("Reporting script: " + args.report)
		let manifest = query_db("f", {}, { ikey })[0]

		let report = { victim: context.caller, z: new Date().getTime() }
		if (!manifest) {
			query_db("us", {
				$set: {
					__script: true,
					ikey,
					level: "unknown",
					sector: "unknown",
					tags: [],
					reports: [report],
					z: new Date().getTime(),
				}
			}, { ikey })
		} else {
			// // Filter out reports from more than 24 hours ago
			manifest.reports = manifest.reports.filter((e) => e.z > new Date().getTime() - (4_3200_000 * 2))

			let prevReport = manifest.reports.find((e) => e.victim === context.caller);
			let canReport = !prevReport;
			// Check if the user has already reported this script in the last 24 hours
			if (!canReport) {
				l.log(`\`DYou have already reported this script in the last 24 hours\``)
				return end()
			}
			manifest.reports.push(report)
			query_db("u1", {
				$set: {
					reports: manifest.reports,
					z: new Date().getTime(),
				}
			}, { ikey })
		}

		l.log("Report sent, thank you")
		return end()
	}


	let instant = new Date().getTime();
	// Query the db for the sector
	let response = (query_db("f", {}, { __script: true, sector: args.sector, level: args.level }) as any[]);
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
		if (args.name && script.name !== args.name) filter_pass = false;
		if (args.publics && !script.ikey.endsWith(".public")) filter_pass = false;
		if (args.prefix && !script.ikey.startsWith(args.prefix)) filter_pass = false;
		if (args.postfix && !script.ikey.endsWith(args.postfix)) filter_pass = false;
		if (args.regex && !script.ikey.match(new RegExp(args.regex))) filter_pass = false;
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

		l.log(`\n\`4Query results for sector\` ${sector.sector} - Last Scanned ${get_hhmmss(new Date().getTime() - sector.scripts[0].z)} ago`)
		switch (sector.scripts[0].level.toLowerCase()) {
			case "fullsec":
				l.log(`\`2FULLSEC:\``);
				break;
			case "highsec":
				l.log(`\`HHIGHSEC:\``);
				break;
			case "midsec":
				l.log(`\`5MIDSEC:\``);
				break;
			case "lowsec":
				l.log(`\`DLOWSEC:\``);
				break;
			case "nullsec":
				l.log(`\`VNULLSEC:\``);
				break;
		}

		for (let j = 0; j < sector.scripts.length; j++) {
			if (args.name) {
				let script = sector.scripts[j]
				let name = script.ikey.replace("#", ".");
				let tag_string = script.tags.length > 0 ? script.tags.join(", ") : "No Tags";
				let report_str = script.reports.length > 0
					? script.reports.length > 1
						? `\`E${script.reports.length} scam reports\``
						: `\`E${script.reports.length} scam report\``
					: "No Scams Reported";

				l.log(
					`Name: ${name}\n`
					+ `Sector: ${script.sector}\n`
					+ `Level: ${script.level}\n`
					+ `Tags: ${tag_string}\n`
					+ `Reports: ${report_str} in the last 24 hours\n`
					+ `Script last indexed: ${get_hhmmss(new Date().getTime() - script.z)} ago\n`
					+ `Open source: ${script.source ? "Yes" : "No"}\n`
					+ `${script.source ? "Source: " + script.source : ""}\n`
					+ `Author: ${script.name.split(".")[0]}\n`
				)

				if (context.caller === script.name.split(".")[0]) {
					l.log(`You are the author of this script\n`
						+ "If you wish to modify the listing, please contact @altrius_codes on discord\n"
						+ "Please understand that scam reports will not be modified unless proof of abuse is provided\n"
						+ "If your script is open source, please send me a link to the code, so I may add it to the database"
					)
				}

			} else {
				let script = sector.scripts[j]
				let name = script.ikey.replace("#", ".");
				let tag_string = script.tags.length > 0 ? script.tags.join(", ") : "No Tags";
				let report_str = script.reports.length > 0
					? script.reports.length > 1
						? `\`E${script.reports.length} scam reports\``
						: `\`E${script.reports.length} scam report\``
					: "No Scams Reported";

				if (script.is_stale)
					l.log(`\`4${pad(j + 1 + "", 4, 0)} - ${pad(name, longest_script_name, 1)}\`\`4 | \`\`ISTALE\`\`4 | \`${report_str}\`4 | \`\`8${tag_string}\``);
				else
					l.log(`\`4${pad(j + 1 + "", 4, 0)} - ${pad(name, longest_script_name, 1)}\`\`4 | \`\`Y     \`\`4 | \`${report_str}\`4 | \`\`8${tag_string}\``);
			}

		}
	}

	let duration = new Date().getTime() - instant;
	l.log(`\n\`YShowing ${sector_count.filtered} of ${sector_count.total} sectors\`\n`
		+ `\`YShowing ${script_count.filtered} of ${script_count.total} scripts\`\n`
		+ `\`YSearch took ${duration} milliseconds to complete\`\n`
		+ `Can't find what you're looking for? Use the argument\n`
		+ `{ showStale: true } to show results which are stale`)


	/**
	 * == SECTION: DONATIONS ==
	 */
	l.log(`\n\`6Want to support my work? Feeling generous?\`\n\`6Use altrius.donate {donate:<amount>} to thank me!\``)
	$fs.chats.send({
		channel: "0000",
		msg: `\n` +
			`I just used altrius.findr to search for something!\n` +
			`Found: ${script_count.filtered} scripts.\n` +
			`Across ${sector_count.filtered} sectors.\n` +
			`Did you know that you can report scams now?\n` +
			`altrius.findr {report: "some.script"}\n` +
			`altrius.findr, in search of a better MUD`
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
	return JSON.parse($fs.fatalcenturion.db({ operand, command: JSON.stringify(command), query: JSON.stringify(query) }))
}

function pad(str: string, length: number, alignment: number = 0): string {
	let pad = "";
	for (let i = 0; i < length - str.length; i++) alignment === 0 ? pad += " " : pad = " " + pad;
	return pad + str;
}