
export default (context: Context, args: { level?: string, /*sector?: string, target?: string, join?: boolean, leave?: boolean,*/ donate?: string | number }) => {
	let logs = []
	if (!args) {
		return {
			ok: true, msg: [
				"`4Meet altrius.finds_things`",
				"`4The free finder of things.`",
				"`4To get started, use the arguments to find sectors of a chosen``Nlevel`",
				"`4Or if you wish to verify the source code of this script. You may find it at https:\/\/github\.com\/altriusrs\/hackmud\/`"
			].join("\n")
		}
	}
	if (Object.keys(args).length === 0) {
		return $fs.scripts.quine()
	}
	const l = $fs.scripts.lib()
	const s = l.security_level_names;
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

		sector_list = sector_list
			.filter((a: string) => /([A-Z]+_){2}\d/.exec(a) !== null);

		logs.push(`Found: ${sector_list.length} sectors`)

		l.each(sector_list, (_, e) => {
			logs.push(`- ${e}`);
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

	if (args.donate) {
		let balance = $ns.accts.balance({ is_script: true })
		let donation = -1;
		if (typeof args.donate !== "number") {
			let donation_num = l.to_gc_num(args.donate);
			if (typeof donation_num !== "number") {
				logs.push(`\t\`DDonation Failed - Invalid Amount\``)
				logs.push(`\t\`8Your donation amount could not be converted into a an acceptable value\``)
				logs.push(`\t\`4We apologise for any inconvenience caused.\``)
			} else {
				donation = donation_num;
			}
		} else donation = args.donate

		if (donation < 0) {
			logs.push(`\t\`DDonation Failed - Invalid Amount\``)
			logs.push(`\t\`8The donation must be > 0\``)
			logs.push(`\t\`4We apologise for any inconvenience caused.\``)
		} else if (donation > balance) {
			logs.push(`\t\`DDonation Failed - Insufficient Funds\``)
			logs.push(`\t\`8The donation must be < ${l.to_gc_str(balance)}\``)
			logs.push(`\t\`4We apologise for any inconvenience caused.\``)
		} else {
			let tax = Math.round((100 / donation) * 5);
			let final = donation - tax;


			let dono_success = true
			let dono_res = $ns.accts.xfer_gc_to({
				to: "altrius",
				amount: final,
				memo: "Donation Through altrius.finds_things, the free finder"
			})
			if (!dono_res.ok) {
				logs.push(`\t\`DDonation Failed - Unknown Error\``)
				logs.push(`\t\`8We're not sure what happened, no GC was taken from your account\``)
				logs.push(`\t\`4We apologise for any inconvenience caused.\``)
				return { ok: true, msg: logs.join("\n") }
			}


			let tax_res = $ns.accts.xfer_gc_to({
				to: "fatalcenturion", // for testing
				//to: "wiz", // send GC to the correct wizmud trustee
				amount: tax,
				memo: "Donation Through altrius.finds_things, the free finder"
			})

			if (!tax_res.ok) {
				logs.push(`\t\`DDonation Failed - Unknown Error\``)
				logs.push(`\t\`8We're not sure what happened, we have fully refunded any GC taken from your account.\``)
				logs.push(`\t\`4We apologise for any inconvenience caused.\``)
				$ns.accts.xfer_gc_to_caller({
					amount: final,
					memo: "Your donation was refunded due to a discrepancy."
				})
				return { ok: true, msg: logs.join("\n") }
			}
			logs.push(`\t\`2Donation Successful\``)
			logs.push(`\t\`8- To creator: ${l.to_gc_str(final)}\``)
			logs.push(`\t\`8- To wizMUD:  ${l.to_gc_str(tax)} (5%)\``)
			logs.push(`\t\`2Thank you for your donation!\``)
		}
	} else {
		logs.push(`\t\`6Want to support my work? Feeling generous?\``)
		logs.push(`\t\`6Use altrius.finds_things {donate:<amount>} to thank me!\``)
		logs.push(`\t\`4A percentage of every donation is forwarded to wizMUD\``)
		logs.push(`\t\`4You will receive a statement detailing your donation\``)
		logs.push(`\t\`4once the transaction is completed\``)
	}

	return { ok: true, msg: logs.join("\n") }
}
