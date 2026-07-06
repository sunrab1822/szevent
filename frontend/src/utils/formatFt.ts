export const formatFt = (n: number): string => new Intl.NumberFormat("hu-HU", { minimumFractionDigits: 2 }).format(n) + " Ft";
