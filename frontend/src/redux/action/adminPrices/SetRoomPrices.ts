import { createAction } from "@reduxjs/toolkit";
import type { RoomPrices } from "../../../entitys/roomPrices";

type Payload = {
    roomPrices: RoomPrices[];
};

export const SetRoomPrices = createAction<Payload>(`ADMIN_PRICES__SET_ROOM_PRICES`);
