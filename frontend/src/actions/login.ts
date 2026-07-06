export const login = async (): Promise<boolean> => {
    location.replace("http://localhost/api/saml/login");

    return true;
};
