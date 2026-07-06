import { Logout } from "../redux/action/session/logout";
import { store } from "../redux/store";

export const logout = async (): Promise<boolean> => {
    location.replace("/api/saml/logout");

    store.dispatch(Logout());

    return true;
};
