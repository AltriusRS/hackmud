/**
 * @author altrius
 * @description A utility script for scraping locs from corps
 * @caution EARLY ACCESS
 * @level FULLSEC
 */
type Scriptor = { name: string, call: (args: any) => unknown }
export default (context: Context, args: { t: Scriptor, confirm?: boolean }) => {
  const l = $fs.scripts.lib();
  const end = () => {
    return l.get_log().join("\n").replaceAll('"', '');
  }

  //let outcome = args.t.call();
  //$D(`Outcome: ${outcome}`);

  let corp = args.t.name;
  let { corps, corp_scripts } = query_db("f", undefined, { __corpdata: true })[0];
  let ikeys = [].concat(...corps.map((c: string) => corp_scripts.map((s: string) => `${c}.${s}`)));
  let require_confirm = false;

  // Check if the scriptor comes from a known npc corp
  if (!ikeys.includes(corp)) {

  }


  if (require_confirm && !args.confirm) {
    l.log("`4[WARN]` - Passed scriptor does not match any known npc corps")
    l.log("`4[WARN]` - Cannot proceed with scan without confirmation")
    l.log("`4[WARN]` - Call again with `Nconfirm`: `3true` to confirm")
    return { ok: false, msg: end() }
  }

  l.log("`N[INFO]` - Scriptor is known npc corp....")
  let output = args.t.call({});

  $D(output);


  return {
    ok: true, msg: end()
  };
}


function query_db(operand: string, command: unknown, query: unknown): unknown {
  return $fs.fatalcenturion.db({ operand, command, query }).q;
}
