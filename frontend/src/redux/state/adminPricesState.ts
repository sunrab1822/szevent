import type { FamulusPrice } from "../../entitys/famulusPrice";
import type { RoomPrices } from "../../entitys/roomPrices";
import type { ServicePrices } from "../../entitys/servicePrices";

export interface AdminPricesState {
    famulusPrices: FamulusPrice[];
    roomPrices: RoomPrices[];
    servicePrices: ServicePrices[];
}
