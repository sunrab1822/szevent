export const login = async (): Promise<boolean> => {
    location.replace("/api/saml/login");

    return true;
};
