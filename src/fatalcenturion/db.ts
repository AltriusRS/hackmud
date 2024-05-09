/**
 * @author altrius
 * @description A db management script designed to query the db for a third party script
 * CAUTION: EARLY ACCESS
 */
export default (context: Context, args: { operand: string, command: any, query: any, limit?: number, sort?: any, page?: number }) => {
    const authUsers = ["_index", "alt_rius", "altrius", "fatalcenturion", "find"];
    let check_bypass = authUsers.includes(context.caller);
    if (!check_bypass) {
        if (!context.calling_script) return {
            ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
        }
        else if (!authUsers.includes(context.calling_script.split(".")[0])) return {
            ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
        }
        if (!args.command || !args.query || !args.operand) return {
            ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
        }
    }

    let { operand, command, query, limit, sort, page } = args

    switch (operand) {
        case "c":
            return { ok: true, q: ($db.f(query, command).count_and_close()) }
        case "i":
            return { ok: true, q: ($db.i(query)) }
        case "u":
            return { ok: true, q: ($db.u(query, command)) }
        case "u1":
            return { ok: true, q: ($db.u1(query, command)) }
        case "us":
            return { ok: true, q: ($db.us(query, command)) }
        case "f":
            let q = $db.f(query, command);
            if (sort) q = q.sort(sort);
            if (page) q = q.skip((page - 1) * limit);
            if (limit) q = q.limit(limit);
            return { ok: true, q: (q.array_and_close()) }
        case "r":
            return { ok: true, q: ($db.r(query)) }
        default:
            return {
                ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
            }
    }
}
