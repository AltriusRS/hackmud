export function query(operand: string, command: unknown, query: unknown, limit?: number, sort?: unknown, page?: number): unknown {
    const response = $fs.fatalcenturion.db({ operand, command, query, limit, sort, page })
    return response.q
}
