export function query<T>(operand: string, command: unknown, query: unknown, limit?: number, sort?: unknown, page?: number): T | T[] {
    const response = $fs.fatalcenturion.db({ operand, command, query, limit, sort, page })
    if (limit === 1) return response.q[0]
    return response.q
}
