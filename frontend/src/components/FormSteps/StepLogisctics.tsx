import React from "react";
import { useFormContext } from "react-hook-form";
import { RHFInput, RHFToggle } from "../FormControls";

const StepLogistics = () => {
    const { watch } = useFormContext();

    // Watch fields to conditionally render dependent inputs
    const needsAccommodation = watch("eventNeedAccommodation");
    const producesTrash = watch("eventProducesTrash");
    const trashDelivery = watch("eventProducesTrashDelivery");

    return (
        <div className="space-y-4">
            <RHFInput name="eventNature" label="Rendezvény jellege" required />

            <RHFToggle name="eventNeedAccommodation" label="Van szállásigénye?" />
            {needsAccommodation && (
                <div className="rounded-lg bg-blue-50 p-4">
                    <RHFInput name="eventNeedAccommodationNumber" label="Szállásigény létszáma (fő)" type="number" required />
                </div>
            )}

            <RHFToggle name="eventProducesTrash" label="Keletkezik hulladék?" />
            {producesTrash && (
                <div className="space-y-3 rounded-lg bg-blue-50 p-4">
                    {/* Select component for trashDelivery goes here */}
                    {trashDelivery === "Saját úton" && (
                        <RHFInput name="eventProducesTrashDeliveryWhoDelivers" label="Ki szállítja el?" required />
                    )}
                </div>
            )}

            {/* You would continue plotting out the rest of your Step 2 toggles here using the exact same pattern! */}
        </div>
    );
};

export default StepLogistics;
