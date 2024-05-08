/**
 * @author altrius
 * @description A utility script designed to locate things for people
 * @caution EARLY ACCESS
 * @level FULLSEC
 */

// @autocomplete {name: "some.script", report: "some.script", user: "username", publics: false, prefix: "some_prefix", postfix: "some_postfix", regex: "/[a-z0-9_\.]*/", showStale: false, source: false, name: "script.name", level: "fullsec", sector: "CHAOS_LAMBDA_3"
export default (context: Context, args: {
	tags?: string | string[], // The tags to add to the script (comma separated)
	tag?: string,   		  // The script to tag
	name?: string,   		  // The name of the script to search for
	report?: string,          // Allows someone to report a scam script
	level?: string,           // The level to search for
	sector?: string,          // The sector to search for
	target?: string,   	      // The target to search for
	publics?: boolean,        // Whether to show only scripts ending in .public
	prefix?: string,          // The prefix to search for
	postfix?: string,         // The postfix to search for
	regex?: string,           // A regular expression to search for
	showStale?: boolean,      // Whether to show results which are considered stale (IE: those over 12 hours old)
	source?: boolean,         // Whether to show the source code of the findr script
	metrics?: boolean,        // Whether to show the metrics
	open?: string,            // Mark the target script as open (takes a url)
	user?: string,            // The user to search for
}) => {
	// This source file is deprecated, use the find profile version instead
	return $fs.find.r(context, args) // Call the r function from the find profile

}

function get_hhmmss(time: number) {
	time = time / 1000;
	let hours = Math.floor(time / 3600);
	time -= hours * 3600;
	let minutes = Math.floor(time / 60);
	time -= minutes * 60;
	let seconds = Math.floor(time);
	return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}

function query_db(operand: string, command: unknown, query: unknown): unknown {
	return JSON.parse($fs.fatalcenturion.db({ operand, command: JSON.stringify(command), query: JSON.stringify(query) }))
}

function pad(str: string, length: number, alignment: number = 0): string {
	let pad = "";
	for (let i = 0; i < length - str.length; i++) alignment === 0 ? pad += " " : pad = " " + pad;
	return pad + str;
}