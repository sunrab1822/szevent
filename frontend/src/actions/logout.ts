export const logout = async (): Promise<boolean> => {
    localStorage.removeItem(`${import.meta.env.VITE_AUTH_TOKEN}`);
    location.replace("/api/saml/logout");

    return true;
};
