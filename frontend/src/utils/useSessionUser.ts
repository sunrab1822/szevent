import { useSelector } from "../redux/store";

export const useSessionUser = () => {
    const { user } = useSelector((state) => state.session);

    if (!user) {
        throw new Error("useSessionUser must only be used inside protected routes!");
    }

    return user;
};
