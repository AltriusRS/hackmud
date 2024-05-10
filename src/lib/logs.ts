export function end(): string {
    let log = $fs.scripts.lib().get_log().join("\n").replaceAll('"', '')
    // $D(log)
    log = log.split("\\n").join("\n");
    // $D(log)
    return log
}

export function error() {
    return end()
}