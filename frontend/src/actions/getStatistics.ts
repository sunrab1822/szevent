import type { Statistics, StatisticsPeriod } from "../entitys/statistics";

export const getStatistics = async (period: StatisticsPeriod): Promise<Statistics | false> => {
    const searchParams = new URLSearchParams({
        period,
    });

    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/statistics?${searchParams.toString()}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        method: "GET",
    });

    if (!response.ok) {
        return false;
    }

    return response.json();
};
