import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input, InputNumber, Select, DatePicker, Checkbox } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export const RHFToggle = ({ name, label }: { name: string; label: string }) => {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error, isTouched } }) => (
                <div className="flex flex-col justify-between border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:items-center">
                    <span className="mb-2 max-w-[70%] text-sm font-medium text-gray-700 sm:mb-0 sm:text-base">
                        {label} <span className="text-red-500">*</span>
                    </span>
                    <div
                        className={`flex items-center rounded-lg border p-1 transition-all duration-300 ${error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                    >
                        <button
                            type="button"
                            onClick={() => field.onChange(false)}
                            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${field.value === false ? "bg-red-100 text-red-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
                        >
                            Nem
                        </button>
                        <button
                            type="button"
                            onClick={() => field.onChange(true)}
                            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${field.value === true ? "bg-green-100 text-green-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
                        >
                            Igen
                        </button>
                        {error && (
                            <div className="ml-2 animate-pulse text-red-400" title={error.message}>
                                <WarningOutlined />
                            </div>
                        )}
                    </div>
                </div>
            )}
        />
    );
};

// Generic Text Input Wrapper
export const RHFInput = ({ name, label, required = false, type = "text", ...props }: any) => {
    const { control } = useFormContext();
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <div className="mb-4">
                    {label && (
                        <label className="mb-1 block text-sm font-semibold">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}
                    {type === "textarea" ? (
                        <Input.TextArea rows={3} {...field} {...props} status={error ? "error" : ""} />
                    ) : (
                        <Input size="large" {...field} {...props} status={error ? "error" : ""} />
                    )}
                    {error && <span className="text-xs text-red-500">{error.message}</span>}
                </div>
            )}
        />
    );
};

// Generic DatePicker Wrapper (handles dayjs conversion)
export const RHFDatePicker = ({ name, label, required = false }: { name: string; label: string; required?: boolean }) => {
    const { control } = useFormContext();
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <div className="mb-4">
                    <label className="mb-1 block text-sm font-semibold">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <DatePicker
                        showTime
                        className="w-full"
                        size="large"
                        format="YYYY-MM-DD HH:mm"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(d) => field.onChange(d ? d.format("YYYY-MM-DDTHH:mm") : "")}
                        status={error ? "error" : ""}
                    />
                    {error && <span className="text-xs text-red-500">{error.message}</span>}
                </div>
            )}
        />
    );
};
