import { createAction } from "@reduxjs/toolkit";

export const SetSidebarOpen = createAction<boolean>(`GLOBAL_PROPS__SET_SIDEBAR_OPEN`);
