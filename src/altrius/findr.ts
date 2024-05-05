/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * @caution EARLY ACCESS
 * @level FULLSEC
 */
export default (context: Context, args: {
	tags?: string,			  // The tags to add to the script (comma separated)
	tag?: string,             // The script to tag
	report?: string,          // Allows someone to report a scam script
	level?: string,           // The level to search for
	sector?: string,          // The sector to search for
	target?: string,   	      // The target to search for
	publics?: boolean,        // Whether to show only scripts ending in .public
	prefix?: string,          // The prefix to search for
	postfix?: string,         // The postfix to search for
	regex?: string,           // A regular expression to search for
	showEmpty: boolean,       // Whether to show empty results
	showStale?: boolean,      // Whether to show results which are considered stale (IE: those over 12 hours old)
	source?: boolean,         // Whether to show the source code of the findr script
}) => {
	const end = () => l.get_log().join("\n").replaceAll('"', '')
	// Preload the stdlib
	const l = $fs.scripts.lib()
	const empty_manifest = { reports: [], tags: [] }

	l.log("`5:::::::::: ::::::::::: ::::    ::: :::::::::  :::::::::  `");
	l.log("`f:+:            :+:     :+:+:   :+: :+:    :+: :+:    :+: `");
	l.log("`g+:+            +:+     :+:+:+  +:+ +:+    +:+ +:+    +:+ `");
	l.log("`o:#::+::#       +#+     +#+ +:+ +#+ +#+    +:+ +#++:++#:  `");
	l.log("`n+#+            +#+     +#+  +#+#+# +#+    +#+ +#+    +#+ `");
	l.log("`p#+#            #+#     #+#   #+#+# #+#    #+# #+#    #+# `");
	l.log("`3###        ########### ###    #### #########  ###    ### `");
	l.log("`NWritten by Altrius``8     EARLY    ACCESS     ``YVersion 0.1.2 `");
	l.log("`8                       ‾‾‾‾‾‾‾‾    ‾‾‾‾‾‾‾‾‾‾‾`");

	let is_valid = true

	if (args) {
		let filters = Object.keys(args)
		let invalids = filters.filter((e) => !["report", "showEmpty", "showStale", "level", "sector", "publics", "prefix", "postfix", "regex"].includes(e))
		if (invalids.length > 0) {
			invalids.map((e) => l.log(`\`DInvalid argument: ${e}\``))
			is_valid = false
		} else if (filters.length === 0) is_valid = false
	} else is_valid = false

	// If no arguments are provided, print a help message
	if (!is_valid) {
		l.log("")
		l.log(`Meet ${context.this_script}`)
		l.log("The always free script finder!")
		l.log(`\`DScammed by a script? Report the script to us with the argument\` { report: "<script_name>" }`)
		l.log("To get started, use the arguments below to find scripts you might be interested in")
		l.log("- `2showEmpty`   - Shows empty results")
		l.log("- `2showStale`   - Show results which are considered stale (IE: those over 12 hours old)")
		l.log("- `2level`       - The security level to search within")
		l.log("- `2sector`      - The sector to search within")
		l.log("- `2publics`     - Whether to show only scripts ending in `2.public`")
		l.log("- `2prefix`      - The prefix to search for")
		l.log("              > For example, to find all scripts starting in `2wiz.`, use the argument `2wiz.`")
		l.log("- `2postfix`     - The postfix to search for")
		l.log("              > For example, to find all scripts ending in `2.bank`, use the argument `2.bank`")
		l.log("- `2regex`       - A regular expression to search for")
		l.log("              > play around with the regex tester at https:\/\/regex101.com\/")
		l.log("              > For example, to find all scripts containing a number use the argument `2[0-9]`")
		l.log("")
		l.log("`5ORDER OF EXECUTION:`")
		l.log("`5- The order of execution is as listed above`")
		l.log("")
		l.log("If you wish to verify the source code of this script. You may find it at ")
		l.log("https:\/\/github\.com/altriusrs/hackmud/")
		l.log(`The source code for this script is obfuscated on here, but may be accessed using  ${context.this_script} {}`)
		return end()
	}

	// if the arguments object is empty, print the source code
	if (Object.keys(args).length === 0) return $fs.scripts.quine()

	if (args.tag) {
		const ikey = args.tag.replace(".", "#")
		l.log("Tagging script: " + args.report)
		let manifest = query_db("f", {}, { _reports: true })[0]

		if (!manifest[ikey]) manifest[ikey] = empty_manifest

		manifest[ikey].tags = manifest[ikey].tags.concat(args.tags.split(","))

		query_db("us", {
			$set: {
				[ikey]: manifest[ikey],
			}
		}, { _reports: true })
		l.log("Report sent, thank you")
		return end()
	}

	if (args.report) {
		const ikey = args.report.replace(".", "#")
		l.log("Reporting script: " + args.report)
		let manifest = query_db("f", {}, { _reports: true })[0]

		if (!manifest[ikey]) manifest[ikey] = empty_manifest
		// Filter out reports from more than 24 hours ago
		manifest[ikey].reports = manifest[ikey].reports.filter((e) => e.z > new Date().getTime() - 24 * 60 * 60 * 1000)

		let prevReport = manifest[ikey].reports.find((e) => e.victim === context.caller);
		let canReport = !prevReport;

		// Check if the user has already reported this script in the last 24 hours
		if (!canReport) {
			l.log(`\`DYou have already reported this script in the last 24 hours\``)
			return l.get_log().join("\n").replaceAll('"', '')
		}

		manifest.reports.push({ victim: context.caller, z: new Date().getTime() })

		query_db("us", {
			$set: {
				_reports: true,
				[ikey]: manifest[ikey],
			}
		}, { _reports: true })
		l.log("Report sent, thank you")
		return end()
	}


	let instant = new Date().getTime();
	// Query the db for the sector
	let response = (query_db("f", {}, { sector: args.sector, level: args.level }) as any[]).filter((e) => e.level && e.sector);
	let reports = query_db("f", {}, { _reports: true })[0]
	let sector_count = { filtered: 0, total: 0 };
	let script_count = { filtered: 0, total: 0 };

	for (let i = 0; i < response.length; i++) {
		let sector = response[i];
		sector_count.total++;
		script_count.total += sector.scripts.length;

		if (!sector.scripts || sector.scripts.length === 0) sector.scripts = ["No Scripts Cached"]

		sector.scripts = sector.scripts.filter((e: string) => {
			if (args.publics && !e.endsWith(".public")) return false;
			if (args.prefix && !e.startsWith(args.prefix)) return false;
			if (args.postfix && !e.endsWith(args.postfix)) return false;
			if (args.regex && !e.match(new RegExp(args.regex))) return false;
			return true;
		})


		if (sector.scripts.length === 0) {
			if (args.showEmpty) sector.scripts.push("No Scripts Cached");
			else continue;
		}

		if (!args.showStale && new Date().getTime() - sector.z > 12 * 60 * 60 * 1000) continue;
		sector_count.filtered++;
		script_count.filtered += sector.scripts.length;

		l.log(``)
		l.log(`\`4Query results for sector\` ${sector.sector} - Last Scanned ${get_hhmmss(new Date().getTime() - sector.z)} ago`)
		switch (sector.level.toLowerCase()) {
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

		let longest_script_name = Math.max(...sector.scripts.map((e) => e.length));

		sector.scripts.map((e, i,) => {
			let manifest = Object.assign(empty_manifest, reports[e.replace(".", "#")])
			let tag_str = manifest.tags.length > 0 ? manifest.tags.join(", ") : "No Tags"
			let report_str = "`2No Scams Reported`"
			if (manifest.reports)
				if (manifest.reports.length > 1 || manifest.reports.length === 0)
					report_str = `\`E${manifest.reports.length} scam reports\``
				else report_str = `\`E${manifest.reports.length} scam report\``

			l.log(`\`4${pad(i + 1 + "", 4, 0)} - ${pad(e, longest_script_name, 1)}\`\`4 | \`${report_str}\`4 | \`\`8${tag_str}\``);
		});
	}
	l.log(``)
	let duration = new Date().getTime() - instant;
	l.log(`\`YShowing ${sector_count.filtered} of ${sector_count.total} sectors\``)
	l.log(`\`YShowing ${script_count.filtered} of ${script_count.total} scripts\``)
	l.log(`\`YSearch took ${duration} milliseconds to complete\``)
	l.log(`Can't find what you're looking for? Use the argument`)
	l.log(`{ showStale: true } to show results which are stale`)


	/**
	 * == SECTION: DONATIONS ==
	 */
	l.log(``)
	l.log(`\`6Want to support my work? Feeling generous?\``)
	l.log(`\`6Use altrius.donate {donate:<amount>} to thank me!\``)
	$fs.chats.send({
		channel: "magnificent_mansion",
		msg: "\nI just used altrius.findr to find " + script_count.filtered + " scripts \nin " + sector_count.filtered + " sectors. I hope you like it!"
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