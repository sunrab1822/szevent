export const parsePrice = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    return parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
};
