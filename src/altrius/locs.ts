/**
 * @author altrius
 * @description A utility script for scraping locs from corps
 * @caution EARLY ACCESS
 * @level FULLSEC
 */
type Scriptor = { name: string, call: (args: any) => unknown }
export default (context: Context, args: { t: Scriptor, confirm?: boolean, rank: string, class: string }) => {
  const l = $fs.scripts.lib();



  const result = $fs.ast.t2_scraper({ t: args.t });
  const locs = result;

  const locStrings = [];

  for (let i = 0; i < locs.length; i++) {
    const name = locs[i];
    const [prefix, datablock, ...suffix] = name.split("_");
    let loc_rank = 'Junkrack';
    let loc_class = 'Architect';
    const rank_str = datablock.substring(0, 2);
    const class_str = datablock.substring(2, 5);
    switch (rank_str) {
      case 'jr': loc_rank = 'junkrack'; break;
      case 'dd': loc_rank = 'diggerdeck'; break;
      case 'wb': loc_rank = 'wreckbox'; break;
      case 'pr': loc_rank = 'phreakrig'; break;
      case 'ls': loc_rank = 'leetstack'; break;
    }


    switch (class_str) {
      case 'wvr': loc_class = 'architect'; break;
      case 'ttl': loc_class = 'lock'; break;
      case 'wlf': loc_class = 'infiltrator'; break;
      case 'rvn': loc_class = 'scavenger'; break;
      case 'stg': loc_class = 'executive'; break;
    }

    let valid = true;
    if (args.rank) valid = valid && loc_rank === args.rank;
    if (args.class) valid = valid && loc_class === args.class;

    if (!valid) continue;

    locStrings.push(`${name}`)
  }


  const text = l.columnize(locStrings);
  $D(text);

  // //let outcome = args.t.call();
  // //$D(`Outcome: ${outcome}`);

  // let corp = args.t.name;
  // let { corps, corp_scripts } = query_db("f", undefined, { __corpdata: true })[0];
  // let ikeys = [].concat(...corps.map((c: string) => corp_scripts.map((s: string) => `${c}.${s}`)));
  // let require_confirm = false;

  // // Check if the scriptor comes from a known npc corp
  // if (!ikeys.includes(corp)) {

  // }

  // if (require_confirm && !args.confirm) {
  //   l.log("`4[WARN]` - Passed scriptor does not match any known npc corps")
  //   l.log("`4[WARN]` - Cannot proceed with scan without confirmation")
  //   l.log("`4[WARN]` - Call again with `Nconfirm`: `3true` to confirm")
  //   return { ok: false, msg: end() }
  // }

  // l.log("`3[ OK ]` - Scriptor is known npc corp....")
  // let listicleRegex = /([a-z0-9]+\:(?:"?)[a-z0-9]+(?:"?))/;
  // let output = args.t.call({}) as string;
  // let listicles = listicleRegex.exec(output);
  // let retries = 0;

  // while (!listicles && retries < 4) {
  //   listicles = listicleRegex.exec(output);
  //   if (!listicles) {
  //     l.log("`4[WARN]` - Scriptor returned unparsable output " + (retries + 1) + " times sequentially")
  //     retries += 1;
  //   }
  //   if (retries === 4) {
  //     l.log("`D[ERR ]` - Cannot proceed, script output did not provide a result five times in a row");
  //     l.log("`D[ERR ]` - The script may be corrupted in a way which makes ")
  //     return { ok: false, msg: end() }
  //   }
  // }
  // let [argument, page] = listicles[0].split(":");


  // l.log(`\`Y[DEBG]\` - page argument: \`N${argument}\``);
  // l.log(`\`Y[DEBG]\` - project list: \`3${page}\``);
  // return {
  //   ok: true, msg: end()
  // };
}


