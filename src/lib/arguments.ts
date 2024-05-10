/**
 * @param args {any} - The arguments to validate
 * @param valid_args {string[]} - The valid arguments
 * @returns {[boolean, string[]]} - A tuple containing a boolean indicating whether the arguments are valid and an array of error messages
 */
export function validate(args: any, valid_args: string[]): [boolean, string[]] {
    const filters = Object.keys(args)
    const invalids = filters.filter((e) => !valid_args.includes(e))
    if (invalids.length > 0) {

        return [false, invalids.map((e) => `\`DInvalid argument: ${e}\``)]
    } else if (filters.length === 0) return [false, ["No arguments provided"]]
    else return [true, []]
}