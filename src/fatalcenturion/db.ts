/**
 * @author altrius
 * @description A db management script designed to query the db for a third party script
 * CAUTION: EARLY ACCESS
 */
export default (context: Context, args: { operand: string, command: string, query: string }) => {
    let check_bypass = context.caller === "fatalcenturion" || context.caller === "altrius"
    if (!check_bypass) {
        if (!context.calling_script) return {
            ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
        }
        else if (!context.calling_script.startsWith("altrius.")) return {
            ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
        }
        if (!args.command || !args.query || !args.operand) return {
            ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
        }
    }

    let command = JSON.parse(args.command as string) as any;
    let query = JSON.parse(args.query as string) as any;

    switch (args.operand) {
        case "i":
            return JSON.stringify($db.i(query))
        case "u":
            return JSON.stringify($db.u(query, command))
        case "u1":
            return JSON.stringify($db.u1(query, command))
        case "us":
            return JSON.stringify($db.us(query, command))
        case "f":
            return JSON.stringify($db.f(query, command).array_and_close())
        case "r":
            return JSON.stringify($db.r(query))
        default:
            return {
                ok: false, msg: "`eUNAUTHORIZED` - This script is only for use by permitted users.\nYou are not 'permitted users'"
            }
    }
}
