/**
 * @author altrius
 * @description A db management script designed to query the db for a third party script
 * CAUTION: EARLY ACCESS
 */
export default (context: Context, args: { operand: string, command: any, query: any }) => {
    const authUsers = ["_index", "alt_rius", "altrius", "fatalcenturion", "find"];
    let check_bypass = authUsers.includes(context.caller);
    if (!check_bypass) {
        if (!context.calling_script) return {
            ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
        }
        else if (!authUsers.includes()) return {
            ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
        }
        if (!args.command || !args.query || !args.operand) return {
            ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
        }
    }

    let { operand, command, query } = args

    switch (operand) {
        case "i":
            return { ok: true, q: ($db.i(query)) }
        case "u":
            return { ok: true, q: ($db.u(query, command)) }
        case "u1":
            return { ok: true, q: ($db.u1(query, command)) }
        case "us":
            return { ok: true, q: ($db.us(query, command)) }
        case "f":
            return { ok: true, q: ($db.f(query, command).array_and_close()) }
        case "r":
            return { ok: true, q: ($db.r(query)) }
        default:
            return {
                ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
            }
    }
}
