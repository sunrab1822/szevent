import type { ConfigTypes } from "../entitys/datasheetConfig";

interface DetailRowProps {
    label: string;
    value: any;
    isEditing: boolean;
    type?: ConfigTypes;
    onChange?: (value: any) => void;
}

const DetailRow = ({ label, value, isEditing, type, onChange }: DetailRowProps) => {
    const renderDisplayValue = () => {
        if (value === "" || value === null || value === undefined) {
            return "-";
        }

        if (type === "boolean") {
            return value === true || value === "true" ? "Igen" : "Nem";
        }

        if (type === "checkbox") {
            if (Array.isArray(value)) {
                return value.length > 0 ? value.join(", ") : "-";
            }
            return String(value);
        }

        return <span className="whitespace-pre-wrap">{value}</span>;
    };

    const renderEditInput = () => {
        const baseInputClasses =
            "w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-[#00677e] focus:ring-1 focus:ring-[#00677e]";

        if (!type) {
            return (
                <textarea
                    value={value || ""}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    className={`${baseInputClasses} min-h-[80px] resize-y`}
                />
            );
        }

        if (type === "boolean") {
            return (
                <input
                    type="checkbox"
                    checked={value === true || value === "true"}
                    onChange={(e) => onChange && onChange(e.target.checked)}
                    className="h-4 w-4 accent-[#00677e]"
                />
            );
        }

        if (type === "checkbox") {
            return (
                <input
                    type="text"
                    value={Array.isArray(value) ? value.join(", ") : value || ""}
                    placeholder="Vesszővel elválasztva (pl: item1, item2)"
                    onChange={(e) => {
                        if (onChange) {
                            const arrayValue = e.target.value
                                .split(",")
                                .map((i) => i.trim())
                                .filter((i) => i !== "");
                            onChange(arrayValue);
                        }
                    }}
                    className={baseInputClasses}
                />
            );
        }

        return (
            <input type={type} value={value || ""} onChange={(e) => onChange && onChange(e.target.value)} className={baseInputClasses} />
        );
    };

    return (
        <div className="contents break-all">
            <span className="py-1 pr-2 font-semibold">{label}:</span>
            <div className="py-1">{isEditing ? renderEditInput() : renderDisplayValue()}</div>
        </div>
    );
};
export default DetailRow;
