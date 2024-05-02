/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * CAUTION: EARLY ACCESS
 */
export default (context: Context, args: { level?: string, /*sector?: string, target?: string, join?: boolean, leave?: boolean,*/ donate?: string | number }) => {
	// If no arguments are provided, print a help message
	if (!args) {
		return {
			ok: true, msg: [
				"`4Meet altrius.finds_things`",
				"`4The free finder of things.`",
				"`4To get started, use the arguments to find sectors of a chosen security ``Nlevel`",
				"`4Or if you wish to verify the source code of this script. You may find it at https:\/\/github\.com\/altriusrs\/hackmud\/`",
				"`4The source code for this script is obfuscated on here, but can be accessed using altrius.finds_things {}`"
			].join("\n")
		}
	}

	// if the arguments object is empty, print the source code
	if (Object.keys(args).length === 0) {
		return $fs.scripts.quine()
	}

	// Preload the stdlib
	const l = $fs.scripts.lib()

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
		sector_list = sector_list
			.filter((a: string) => /([A-Z]+_){2}\d/.exec(a) !== null);

		l.log(`Found: ${sector_list.length} sectors`)

		l.each(sector_list, (_, e) => {
			l.log(`- ${e}`);
			// if (args.join) $ms.chats.join({ channel: e })
			// if (args.leave) $ms.chats.leave({ channel: e })
		});

		$fs.chats.send({ channel: "altri_testing", msg: `\nI just found \`5${sector_list.length}\` sectors using altrius.finds_things` })
		// } else if (args.sector) {

		// } else if (args.target) {

	}
	// if (args.join && args.leave)
	// 	return {
	// 		ok: true, msg: [
	// 			"`DERROR`  `Njoin` conflicts `Nleave`.",
	// 		].join("\n")
	// 	}

	// if the user wishes to donate, this is where we process that information
	if (args.donate) {
		let balance = $ns.accts.balance({ is_script: true })
		let donation = -1;

		// if the donation was provided as a string, convert to number, or do nothing
		if (typeof args.donate !== "number") {
			let donation_num = l.to_gc_num(args.donate);
			if (typeof donation_num !== "number") {
				l.log(`\t\`DDonation Failed - Invalid Amount\``)
				l.log(`\t\`8Your donation amount could not be converted into a an acceptable value\``)
				l.log(`\t\`4We apologise for any inconvenience caused.\``)
			} else {
				donation = donation_num;
			}
		} else donation = args.donate

		// validate that the donation is not negative, 0, or higher than the caller's balance
		if (donation < 0) {
			l.log(`\t\`DDonation Failed - Invalid Amount\``)
			l.log(`\t\`8The donation must be > 0\``)
			l.log(`\t\`4We apologise for any inconvenience caused.\``)
		} else if (donation > balance) {
			l.log(`\t\`DDonation Failed - Insufficient Funds\``)
			l.log(`\t\`8The donation must be < ${l.to_gc_str(balance)}\``)
			l.log(`\t\`4We apologise for any inconvenience caused.\``)
		} else {
			// calculate a value to send to the donation cause based on a percentage
			let tax = Math.round((100 / donation) * 5);
			let final = donation - tax;

			let dono_res = $ns.accts.xfer_gc_to({
				to: "altrius",
				amount: final,
				memo: "Donation Through altrius.finds_things, the free finder"
			})
			if (!dono_res.ok) {
				l.log(`\t\`DDonation Failed - Unknown Error\``)
				l.log(`\t\`8We're not sure what happened, no GC was taken from your account\``)
				l.log(`\t\`4We apologise for any inconvenience caused.\``)
				return { ok: true, msg: l.get_log().join("\n") }
			}


			let tax_res = $ns.accts.xfer_gc_to({
				to: "fatalcenturion", // for testing
				//to: "wiz", // send GC to the correct wizmud trustee
				amount: tax,
				memo: "Donation Through altrius.finds_things, the free finder"
			})

			if (!tax_res.ok) {
				l.log(`\t\`DDonation Failed - Unknown Error\``)
				l.log(`\t\`8We're not sure what happened, we have fully refunded any GC taken from your account.\``)
				l.log(`\t\`4We apologise for any inconvenience caused.\``)
				$ns.accts.xfer_gc_to_caller({
					amount: final,
					memo: "Your donation was refunded due to a discrepancy."
				})
				return { ok: true, msg: l.get_log().join("\n") }
			}
			l.log(`\t\`2Donation Successful\``)
			l.log(`\t\`8- To creator: ${l.to_gc_str(final)}\``)
			l.log(`\t\`8- To wizMUD:  ${l.to_gc_str(tax)} (5%)\``)
			l.log(`\t\`2Thank you for your donation!\``)
		}
	} else {
		l.log(`\t\`6Want to support my work? Feeling generous?\``)
		l.log(`\t\`6Use altrius.finds_things {donate:<amount>} to thank me!\``)
		l.log(`\t\`4A percentage of every donation is forwarded to wizMUD\``)
		l.log(`\t\`4You will receive a statement detailing your donation\``)
		l.log(`\t\`4once the transaction is completed\``)
	}

	return { ok: true, msg: l.get_log().join("\n").replaceAll('"', '') }
}
