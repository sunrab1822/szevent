export const formatTime = (timestamp: number | string) => {
    if (!timestamp) return "";

    const date = new Date(
        typeof timestamp === "string" ? timestamp : String(timestamp).length <= 10 ? Number(timestamp) * 1000 : Number(timestamp)
    );

    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    if (date >= today) {
        return timeString;
    } else if (date >= yesterday) {
        return `Tegnap ${timeString}`;
    } else {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${month}. ${day}. ${timeString}`;
    }
};
