/**
 * @author altrius
 * @description A utility script for making donations quick and easy
 * @caution EARLY ACCESS
 * @level MIDSEC
 */
export default (context: Context, args: {
    donate?: string | number, // The amount to donate to the cauase
    source?: boolean          // Whether to show the source code of the donation script
    donateSource?: boolean    // Whether to show the user the source code of the donation script
}) => {
    const l = $fs.scripts.lib();

    l.log("`5:::::::::   ::::::::  ::::    :::  ::::::::  `")
    l.log("`f:+:    :+: :+:    :+: :+:+:   :+: :+:    :+: `")
    l.log("`g+:+    +:+ +:+    +:+ :+:+:+  +:+ +:+    +:+ `")
    l.log("`o+#+    +:+ +#+    +:+ +#+ +:+ +#+  +#++:++#  `")
    l.log("`n+#+    +#+ +#+    +#+ +#+  +#+#+# +#+    +#+ `")
    l.log("`p#+#    #+# #+#    #+# #+#   #+#+# #+#    #+# `")
    l.log("`3#########   ########  ###    ####  ########  `")
    l.log("`eWritten by Altrius             Version 1.0.0 `")
    l.log("")

    if (!args) args = {}
    if (args.source) return $fs.scripts.quine()

    // if the donationSource argument is present, process...
    if (args.donateSource) return $ms.find.lib_donate({ donate: 0, source: true, is_script: true });

    if (args.donate) {
        // if the donate argument is present, process...
        let dono = $ms.find.lib_donate({
            donate: args.donate,       // The amount to donate to the cause
            source: false,             // If this is being called from another script, the source code is not needed
            is_script: true,           // This is a script, so we need to pass this argument
            tax_rate: 5,               // 5% tax
            tax_target: "wiz",         // The account to send the tax amount to
            donation_target: "altrius" // The account to send the donation to
        });

        // Merge the donation output with the finds_things output
        if (dono.ok) {
            l.log("Thank you for your donation! Below you will find a statement detailing your donation")
            l.log("You may see the user `` in your transactions. This is my library script")
            l.log("handling the transaction. You may also see the user `2wiz` in your transactions. This is")
            l.log("the account to which a 5% donation is sent to. This is a normal part of the donation process")
            l.log("`FThank you for your donation!`")
            $fs.chats.tell({ to: "altrius", msg: "I just donated `2" + args.donate + "` to you and the wizMUD community" })
            $fs.find.lib_modify({ op: "donate", passthrough: { amount: (typeof args.donate === "string") ? l.to_gc_num(args.donate) : args.donate } })
        }
        dono.msg.map((m) => l.log(m))
    }

    // if no args are provided, print the help message
    if (Object.keys(args).length === 0) {
        l.log(`\`4This script is here to provide a quick and easy way to donate to me.\``)
        l.log(`\`4It is a MIDSEC script, and is called internally.\``)
        l.log(`\`4The donation script internally calls a library which I wrote, both can be located at the links below\``)
        l.log(`\`4Donations: \`\`3https:\/\/github\.com\/altriusrs\/hackmud\/blob\/main\/src\/find\/donate.ts\``)
        l.log(`\`4Library: \`\`3https:\/\/github\.com\/altriusrs\/hackmud\/blob\/main\/src\/find\/lib_donate.ts\``)
        l.log("The source code for this script is obfuscated on here, but can be accessed using arguments listed below")
        l.log("To view the source code of this script, use the argument { source: true }")
        l.log("To view the source code of the donation library, use the argument { donationSource: true }")
        l.log("");
        l.log("`4To donate to me, call this script with the argument { donate: <amount> }`")
        l.log("`4For example, to donate 100GC to me, call this script with the argument { donate: \"100 }`")
        l.log("`4You may also pass a GC string to the argument, for example, { donate:\"100GC\" }`")
    };

    return l.get_log().map((e) => "  " + e).join("\n").replaceAll("\\", "").replaceAll('"', '')
}