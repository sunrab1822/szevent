import React from "react";
import { RHFInput, RHFDatePicker, RHFToggle } from "../FormControls";
import { Controller, useFormContext } from "react-hook-form";
import { Select, InputNumber } from "antd";

const StepBasicInfo = () => {
    const { control } = useFormContext();

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <RHFInput name="eventName" label="Rendezvény neve" required />
            <RHFInput name="eventLocation" label="Helyszín" required />

            <div className="md:col-span-2">
                <RHFInput name="eventDescription" label="Leírás" type="textarea" required />
            </div>

            <div className="md:col-span-2">
                <RHFInput name="eventAddress" label="Pontos cím" required />
            </div>

            <RHFDatePicker name="eventStartDate" label="Kezdés" required />
            <RHFDatePicker name="eventEndDate" label="Befejezés" required />

            <div className="mb-4">
                <label className="mb-1 block text-sm font-semibold">
                    Típus <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="eventType"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                        <Select
                            {...field}
                            className="w-full"
                            size="large"
                            status={error ? "error" : ""}
                            options={[
                                { value: "Egyetemi szervezésű rendezvények", label: "Egyetemi szervezésű" },
                                { value: "Hallgatói rendezvények", label: "Hallgatói" },
                            ]}
                        />
                    )}
                />
            </div>

            <div className="mb-4">
                <label className="mb-1 block text-sm font-semibold">
                    Minősítés <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="eventQualification"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                        <Select
                            {...field}
                            className="w-full"
                            size="large"
                            status={error ? "error" : ""}
                            options={[
                                { value: "Nyílvános", label: "Nyilvános" },
                                { value: "Zártkörű", label: "Zártkörű" },
                            ]}
                        />
                    )}
                />
            </div>

            <div className="pt-2 md:col-span-2">
                <RHFToggle name="eventPublic" label="Sajtónyilvános rendezvény?" />
            </div>
        </div>
    );
};

export default StepBasicInfo;
