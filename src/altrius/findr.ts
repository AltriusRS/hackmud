/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * @caution EARLY ACCESS
 * @level FULLSEC
 */
export default (context: Context, args: {
	level?: string,           // The level to search for
	sector?: string,          // The sector to search for
	target?: string,   	      // The target to search for
	publics?: boolean,        // Whether to show only scripts ending in .public
	prefix?: string,          // The prefix to search for
	postfix?: string,         // The postfix to search for
	regex?: string,           // A regular expression to search for
	ignoreEmpty?: boolean,    // Whether to ignore empty results
}) => {

	// Preload the stdlib
	const l = $fs.scripts.lib()
	l.log("`5:::::::::: ::::::::::: ::::    ::: :::::::::  :::::::::  `");
	l.log("`f:+:            :+:     :+:+:   :+: :+:    :+: :+:    :+: `");
	l.log("`g+:+            +:+     :+:+:+  +:+ +:+    +:+ +:+    +:+ `");
	l.log("`o:#::+::#       +#+     +#+ +:+ +#+ +#+    +:+ +#++:++#:  `");
	l.log("`n+#+            +#+     +#+  +#+#+# +#+    +#+ +#+    +#+ `");
	l.log("`p#+#            #+#     #+#   #+#+# #+#    #+# #+#    #+# `");
	l.log("`3###        ########### ###    #### #########  ###    ### `");
	l.log("`NWritten by Altrius``8     EARLY    ACCESS     ``YVersion 0.1.0 `");
	l.log("`8                       ‾‾‾‾‾‾‾‾    ‾‾‾‾‾‾‾‾‾‾‾`")

	let fields = ["ignoreEmpty", "level", "sector", "publics", "prefix", "postfix", "regex"]

	let is_valid = !!args // if the is no argument object, it is invalid

	let filters = Object.keys(args)
	let invalids = filters.filter((e) => !fields.includes(e))
	if (invalids.length > 0) {
		for (let i = 0; i < invalids.length; i++) {
			l.log(`\`DInvalid argument: ${invalids[i]}\``)
		}
		is_valid = false
	}


	// If no arguments are provided, print a help message
	if (!is_valid) {
		l.log("")
		l.log(`Meet ${context.this_script}`)
		l.log("The free finder of things.")
		l.log("To get started, use the arguments below to find scripts you might be interested in")
		l.log("- `2ignoreEmpty` - Ignores empty results")
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
		l.log("`3ORDER OF EXECUTION:`")
		l.log("`3- The order of execution is as listed above`")
		l.log("")
		l.log("To view the source code of this script, use the argument { source: true }")
		l.log("Or if you wish to verify the source code of this script. You may find it at ")
		l.log("https:\/\/github\.com/altriusrs/hackmud/")
		l.log(`The source code for this script is obfuscated on here, but can be accessed using  ${context.this_script} {}`)
		return l.get_log().join("\n").replaceAll('"', '')
	}

	// if the arguments object is empty, print the source code
	if (Object.keys(args).length === 0) return $fs.scripts.quine()

	if (args) {


		// Query the db for the sector
		let response = JSON.parse($fs.fatalcenturion.db({ operand: "f", command: JSON.stringify({}), query: JSON.stringify({ sector: args.sector, level: args.level }) }));

		for (let i = 0; i < response.length; i++) {
			let sector = response[i];

			if (!sector.scripts || sector.scripts.length === 0) sector.scripts = ["No Scripts Cached"]

			if (args.publics) sector.scripts = sector.scripts.filter((e: string) => e.endsWith(".public"))
			if (args.prefix) sector.scripts = sector.scripts.filter((e: string) => e.startsWith(args.prefix))
			if (args.postfix) sector.scripts = sector.scripts.filter((e: string) => e.endsWith(args.postfix))
			if (args.regex) sector.scripts = sector.scripts.filter((e: string) => e.match(new RegExp(args.regex)))
			if (sector.scripts.length === 0) sector.scripts.push("No Scripts Cached")
			if (args.ignoreEmpty && sector.scripts[0] === "No Scripts Cached") continue
			l.log(``)
			l.log(`\`4Query results for sector\` ${sector.sector}`)
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

			sector.scripts.map((e) => l.log(`\`4- ${e}\``));
		}
	}




	/**
	 * == SECTION: DONATIONS ==
	 */
	l.log(``)
	l.log(``)
	l.log(`\`6Want to support my work? Feeling generous?\``)
	l.log(`\`6Use altrius.donate {donate:<amount>} to thank me!\``)
	l.log(`A percentage of every donation is forwarded to wizMUD`)
	l.log(`You will receive a statement detailing your donation`)
	l.log(`once the transaction is completed`)
	l.log(`\`ECAUTION: Donations are handled by a MIDSEC script, called internally\``)
	l.log(`\`EThe donation script internally calls a library which I wrote, both can be located at the links below\``)
	l.log(`\`EDonations: \`\`3https:\/\/github\.com\/altriusrs\/hackmud\/blob\/main\/src\/altrius\/donate.ts\``)
	l.log(`\`ELibrary: \`\`3https:\/\/github\.com\/altriusrs\/hackmud\/blob\/main\/src\/fatalcenturion\/donate_4_me.ts\``)
	return l.get_log().map((e) => "  " + e).join("\n").replaceAll("\\", "").replaceAll('"', '')
}
