/**
 * @author altrius
 * @description A utility script to automate and standardise the handling of donations
 * CAUTION: EARLY ACCESS
 * LEVEL: MIDSEC
 */
export default (context: Context, args: {
    donate?: string | number, // The amount to donate to the cause
    source?: boolean          // Whether to show the source code of the donation script
    is_script?: boolean       // Whether the script is being called from another script
}) => {
    // If the user wants to see the source...
    if (args.source) return $fs.scripts.quine();
    const caller = context.calling_script;
    const DONATION_TARGET = "fatalcenturion";
    // Preload the stdlib
    const l = $fs.scripts.lib()
    // if the user wishes to donate, this is where we process that information
    if (args.donate) {
        let balance = $hs.accts.balance({ is_script: true })
        let donation = -1;

        // if the donation was provided as a string, convert to number, or do nothing
        if (typeof args.donate !== "number") {
            let donation_num = l.to_gc_num(args.donate);
            if (typeof donation_num !== "number") {
                l.log(``)
                l.log(`\t\`DDonation Failed - Invalid Amount\``)
                l.log(`\t\`8Your donation amount could not be converted into a an acceptable value\``)
                l.log(`\t\`4We apologise for any inconvenience caused.\``)
            } else {
                donation = donation_num;
            }
        } else donation = args.donate

        // validate that the donation is not negative, 0, or higher than the caller's balance
        if (donation < 0) {
            l.log(``)
            l.log(`\t\`DDonation Failed - Invalid Amount\``)
            l.log(`\t\`8The donation must be > 0\``)
            l.log(`\t\`4We apologise for any inconvenience caused.\``)
        } else if (donation > balance) {
            l.log(``)
            l.log(`\t\`DDonation Failed - Insufficient Funds\``)
            l.log(`\t\`8The donation must be < ${l.to_gc_str(balance)}\``)
            l.log(`\t\`4We apologise for any inconvenience caused.\``)
        } else {
            // calculate a value to send to the donation cause based on a percentage
            let tax = Math.abs(donation * 0.05); // 5% tax
            let final = donation - tax; // donation minus tax

            let dono_res = $ms.accts.xfer_gc_to({
                to: "fatalcenturion",
                amount: final,
                memo: `Donation to the author`
            }) as any
            if (!dono_res.ok) {
                l.log(``)
                l.log(`\`DDonation Failed - Unknown Error\``)
                l.log(`\`8We're not sure what happened, no GC was taken from your account\``)
                l.log(`\`4We apologise for any inconvenience caused.\``)
                l.log(`\`9${dono_res.msg}\` | Tried to send ${final} GC`)
                return { ok: true, msg: l.get_log().join("\n") }
            } else {
                let tax_res = $ms.accts.xfer_gc_to({
                    to: DONATION_TARGET,
                    amount: tax,
                    memo: `Donation to ${DONATION_TARGET}`,
                }) as any

                if (!tax_res.ok) {
                    l.log(`\`DDonation Failed - Unknown Error\``)
                    l.log(`\`8We're not sure what happened, we have fully refunded any GC taken from your account.\``)
                    l.log(`\`4We apologise for any inconvenience caused.\``)
                    l.log(`\`9${tax_res.msg}\` | Tried to send ${tax} GC`)
                    $fs.accts.xfer_gc_to_caller({
                        amount: final,
                        memo: "Your donation was refunded due to a discrepancy."
                    })
                    return { ok: true, msg: l.get_log().join("\n") }
                } else {
                    l.log(``)
                    l.log(`\`2Donation Successful\``)
                    l.log(`\`8- To creator: ${l.to_gc_str(final)}\``)
                    l.log(`\`8- To wizMUD:  ${l.to_gc_str(tax)} (5%)\``)
                    l.log(`\`2Thank you for your donation!\``)
                }
            }
        }
    } else {
        l.log(``)
        l.log(`\`6Want to support my work? Feeling generous?\``)
        l.log(`\`6Use ${caller} {donate:<amount>} to thank me!\``)
        l.log(`\`4A percentage of every donation is forwarded to wizMUD\``)
        l.log(`\`4You will receive a statement detailing your donation\``)
        l.log(`\`4once the transaction is completed\``)
        l.log(`\`ECAUTION: Donations are handled by a MIDSEC script, called internally\``)
        l.log(`\`EYou may view the source code of this script by passing the argument  ${caller} {donationSource: true}\``)
        l.log(`\`EIt can also be viewed at \`\`3https:\/\/github\.com\/altriusrs\/hackmud\/blob\/main\/src\/fatalcenturion\/donate_4_me.ts\``)
    }
    if (args.is_script) return { ok: true, msg: l.get_log() }
    return { ok: true, msg: l.get_log().join("\n").replaceAll('"', '') }
}