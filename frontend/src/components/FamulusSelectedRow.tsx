import { ChevronDown, Trash2 } from "lucide-react";
import { formatFt } from "../utils/formatFt";
import { PRICEVARIANTS } from "../consts/PriceVariants";
import type { PriceVariantType } from "../redux/type/PriceVariantType";
import { parsePrice } from "../utils/parsePrice";
import type { SelectedItem } from "../entitys/famulusPrice";

interface FamulusSelectedRowProps {
    item: SelectedItem;
    onRemove: (id: number) => void;
    onUpdate: (updated: SelectedItem) => void;
}

export function FamulusSelectedRow({ item, onRemove, onUpdate }: FamulusSelectedRowProps) {
    const total = item.customPrice * item.hours;

    const basePrice = parsePrice(item[item.variant]);

    const handleVariantChange = (variant: PriceVariantType): void => {
        const newBase = parsePrice(item[variant]);
        onUpdate({ ...item, variant, customPrice: newBase, customDiscount: 0 });
    };

    const handlePriceChange = (raw: string): void => {
        const newPrice = parseFloat(raw) || 0;
        const discount = basePrice > 0 ? Math.round((1 - newPrice / basePrice) * 100) : 0;
        onUpdate({ ...item, customPrice: newPrice, customDiscount: discount });
    };

    const handleDiscountChange = (raw: string): void => {
        const discount = parseFloat(raw) || 0;
        const newPrice = Math.round(basePrice * (1 - discount / 100));
        onUpdate({ ...item, customDiscount: discount, customPrice: newPrice });
    };

    return (
        <tr className="border-b border-[#3e484c]/10 transition-colors last:border-0 hover:bg-blue-50/30">
            <td className="w-[28%] py-3 pr-2 pl-4 align-middle">
                <p className="text-[12px] leading-snug font-semibold text-[#3e484c]">{item.name}</p>
            </td>

            <td className="w-[28%] px-2 py-3 align-middle">
                <div className="relative">
                    <select
                        value={item.variant}
                        onChange={(e) => handleVariantChange(e.target.value as PriceVariantType)}
                        className="w-full appearance-none rounded-md border border-[#3e484c]/15 bg-white py-1.5 pr-7 pl-2.5 text-[11px] text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                    >
                        {PRICEVARIANTS.map((v) => (
                            <option key={v.key} value={v.key}>
                                {v.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[#3e484c]/40" />
                </div>
            </td>

            {/* Hours */}
            <td className="w-[15%] px-2 py-3 align-middle">
                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        min={1}
                        value={item.hours}
                        onChange={(e) => onUpdate({ ...item, hours: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-[50%] rounded-md border border-[#3e484c]/15 bg-white px-2 py-1.5 text-center text-[11px] text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                    />
                    <span className="text-[11px] text-[#3e484c]/60">/óra/fő</span>
                </div>
            </td>

            {/* Custom price */}
            <td className="w-[5%] px-2 py-3 align-middle">
                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        min={0}
                        value={item.customPrice}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="w-full rounded-md border border-[#3e484c]/15 bg-white px-2 py-1.5 text-[11px] font-semibold text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                    />
                    <span className="shrink-0 text-[11px] text-[#3e484c]/60">Ft</span>
                </div>
            </td>

            {/* Custom discount */}
            <td className="w-[10%] px-2 py-3 align-middle">
                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        min={0}
                        max={100}
                        value={item.customDiscount}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                        className="w-full rounded-md border border-[#3e484c]/15 bg-white px-2 py-1.5 text-[11px] font-semibold text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                    />
                    <span className="shrink-0 text-[11px] text-[#3e484c]/60">%</span>
                </div>
            </td>

            {/* Row total */}
            <td className="w-[10%] px-2 py-3 text-right align-middle">
                <span className="text-[12px] font-bold text-[#3e484c]">{formatFt(total)}</span>
            </td>

            {/* Remove */}
            <td className="w-[5%] py-3 pr-4 pl-2 align-middle">
                <button
                    onClick={() => onRemove(item.id)}
                    className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Eltávolítás"
                >
                    <Trash2 size={15} />
                </button>
            </td>
        </tr>
    );
}
