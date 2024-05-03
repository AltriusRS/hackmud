/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * CAUTION: EARLY ACCESS
 * LEVEL: MIDSEC DUE TO DONATIONS - ACTUALLY FULLSEC
 */
export default (context: Context, args: {
	level?: string,           // The level to search for
	sector?: string,          // The sector to search for
	target?: string,   	      // The target to search for
	// join?: boolean,           // Redundant, as this is handled by the bot_brain script
	// leave?: boolean,          // Redundant, as this is handled by the bot_brain script
	donate?: string | number, // The amount to donate to the cauase
	donateSource?: boolean    // Whether to show the user the source code of the donation script
}) => {

	// Preload the stdlib
	const l = $fs.scripts.lib()

	l.log("`9     _______           __    ``3   ________    _                  `")
	l.log("`9    / ____(_)___  ____/ /____``3  /_  __/ /_  (_)___  ____  _____ `")
	l.log("`9   / /_  / / __  \/ __  / ___/``3   / / / __  \/ / __  \/ __  / ___/ `")
	l.log("`9  / __/ / / / / / /_/ (__  ) ``3  / / / / / / / / / / /_/ (__  )  `")
	l.log("`9 /_/   /_/_/ /_/ \__,_/____/  ``3 /_/ /_/ /_/_/_/ /_/ \__, /____/   `")
	l.log("`9                             ``3                  /____/          `")

	// If no arguments are provided, print a help message
	if (!args) {
		l.log(`\`4Meet ${context.this_script}\``)
		l.log("`4The free finder of things.`")
		l.log("`4To get started, use the arguments to find sectors of a chosen security ``Nlevel`")
		l.log("`4Or if you wish to verify the source code of this script. You may find it at `")
		l.log("`3https:\/\/github\.com/altriusrs/hackmud/`")
		l.log(`\`4The source code for this script is obfuscated on here, but can be accessed using  ${context.this_script} {}\``)
		return { ok: true, msg: l.get_log().join("\n").replaceAll('"', '') }
	}

	// if the arguments object is empty, print the source code
	if (Object.keys(args).length === 0) return $ms.scripts.quine()

	// get the names of all security levels
	const s = l.security_level_names;

	// if the level argument is present, process...
	if (args.level) {
		let sector_list: string[]
		switch (args.level.toUpperCase()) {
			case s[4]:
				sector_list = $fs.scripts.fullsec()
				break;
			case s[3]:
				sector_list = $fs.scripts.highsec()
				break;
			case s[2]:
				sector_list = $fs.scripts.midsec()
				break;
			case s[1]:
				sector_list = $fs.scripts.lowsec()
				break;
			case s[0]:
				sector_list = $fs.scripts.nullsec()
				break;
			case "ALL":
				sector_list = $fs.scripts.fullsec()
					.concat(
						$fs.scripts.highsec(),
						$fs.scripts.midsec(),
						$fs.scripts.lowsec(),
						$fs.scripts.nullsec()
					);
				break;
			default:
				return {
					ok: true, msg: [
						"`DERROR` Uknown `Nsector`.",
						"`HAccepted values:`",
						"- `VALL`"
					].concat(s.map((s) => `- \`V${s}\``)).join("\n")
				}
		}

		// filter out invalid sectors
		sector_list = sector_list.filter((a: string) => /([A-Z]+_){2}\d/.exec(a) !== null);

		l.log(`Found: ${sector_list.length} sectors`)

		l.each(sector_list, (_, e) => {
			l.log(`- ${e}`);
		});

		// Send the output to the chat
		$fs.chats.send({ channel: "altri_testing", msg: `\nI just found \`5${sector_list.length}\` sectors using altrius.finds_things` })
		// } else if (args.sector) {
		// TODO: Implement sector cracking using internal script
		// } else if (args.target) {
		// TODO: Implement target cracking using internal script
		// }
	}

	/**
	 * == SECTION: DONATIONS ==
	 * Donations are handled by a MIDSEC script, called internally
	 * The script is called `donate_4_me`
	 */

	// if the donationSource argument is present, process...
	if (args.donateSource) return $fs.fatalcenturion.donate_4_me({ donate: 0, source: true, is_script: true });

	// if the donate argument is present, process...
	let dono = $fs.fatalcenturion.donate_4_me({ donate: args.donate, source: args.donateSource, is_script: true });

	// Merge the donation output with the finds_things output
	if (dono.ok) l.log(dono.msg)

	return { ok: true, msg: l.get_log().join("\n").replaceAll('"', '') }
}
