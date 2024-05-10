/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * @caution EARLY ACCESS
 * @level FULLSEC
 */
type Scriptor = { name: string, call: () => unknown }
export default (context: Context, args: { t: Scriptor }) => {
    const l = $fs.scripts.lib()

    const outcome = args.t.call();
    $D(`Outcome: ${outcome}`);
    
        // $D(`Cracking ${args.t.name}`)
        // $fs.wiz.magic_missile({ t: args.t })


    $D(`Done`)
}
