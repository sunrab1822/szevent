import type { PriceColVariants } from "../entitys/priceVariants";

export const PRICEVARIANTS: PriceColVariants[] = [
    { key: "default", label: "Egyetem és UF közötti megrendelések" },
    { key: "weekend", label: "Egyetem és UF közötti megrendelések HÉTVÉGE/ ÜNNEPNAP/ÉJSZAKA (22h-6h)" },
    { key: "external", label: "Külsős megrendelések esetén" },
    { key: "external_weekend", label: "Külsős megrendelések esetén HÉTVÉGE/ ÜNNEPNAP/ÉJSZAKA (22h-6h)" },
];
