export function getCreatedAtFilter(
    startDate?: Date,
    endDate?: Date,
) {
    return {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
    };
}