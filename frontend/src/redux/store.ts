import { configureStore } from "@reduxjs/toolkit";
import { useSelector as originalUseSelector } from "react-redux";
import { sessionReducer } from "./reducer/sessionReducer";
import { eventsReducer } from "./reducer/eventsReducer";
import { globalPropsReducer } from "./reducer/globalPropsReducer";
import { adminPricesReducer } from "./reducer/adminPricesReducer";
import { chatReducer } from "./reducer/chatReducer";
import { usersReducer } from "./reducer/usersReducer";
import { documentsReducer } from "./reducer/documentsReducer";
import { offerReducer } from "./reducer/offerReducer";

export const store = configureStore({
    reducer: {
        session: sessionReducer,
        event: eventsReducer,
        globalProps: globalPropsReducer,
        adminPrices: adminPricesReducer,
        chats: chatReducer,
        users: usersReducer,
        documents: documentsReducer,
        offer: offerReducer,
    },
});

type State = ReturnType<typeof store.getState>;

export const useSelector = originalUseSelector.withTypes<State>();
