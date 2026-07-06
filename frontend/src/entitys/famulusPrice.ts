import type { PriceVariantType } from "../redux/type/PriceVariantType";

export interface FamulusPrice {
    id: number;
    name: string;
    default: number;
    weekend: number;
    external: number;
    external_weekend: number;
    subtitle: string;
}

export interface SelectedItem extends FamulusPrice {
    variant: PriceVariantType;
    customPrice: number;
    customDiscount: number;
    hours: number;
}
