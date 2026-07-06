import { getAllUsers } from "../actions/getAllUsers";

export const usersPageLoader = async () => {
    await getAllUsers();
    return null;
};
