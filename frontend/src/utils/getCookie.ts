export function getCookie(name: string): string | null {
    if (typeof document === "undefined") {
        return null;
    }

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(";").shift();
        localStorage.setItem(`${import.meta.env.VITE_AUTH_TOKEN}`, cookieValue ? decodeURIComponent(cookieValue) : "");
        return cookieValue ? decodeURIComponent(cookieValue) : null;
    }

    return null;
}
