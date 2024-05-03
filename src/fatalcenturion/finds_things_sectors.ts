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

    let dono = $fs.altrius.donate_4_me({ donate: args.donate });
    if (dono.ok) l.log(dono.out)

    return { ok: true, msg: l.get_log().join("\n").replaceAll('"', '') }
}
