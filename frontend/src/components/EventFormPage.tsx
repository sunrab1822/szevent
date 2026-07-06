import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, notification, Typography, Upload } from "antd";
import { CheckOutlined, ExclamationOutlined, UploadOutlined } from "@ant-design/icons";
import { eventSchema, FORM_STEPS_FIELDS, type EventFormValues } from "../entitys/schema";
import StepBasicInfo from "./FormSteps/StepsBasicInfo";
import StepLogistics from "./FormSteps/StepLogisctics";

// import StepOrganizer from "./StepOrganizer";
// import StepLegal from "./StepLegal";

const { Title, Text } = Typography;
const STEPS_LABELS = ["Alapadatok", "Részletek", "Szervező", "Jogi háttér", "Fájl"];

const EventFormPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);

    const methods = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        mode: "onChange",
        defaultValues: {
            eventAddress: "9026 Győr, Egyetem tér 1.",
            eventParticipants: 1,
            // Add other logical defaults here
        },
    });

    const {
        trigger,
        handleSubmit,
        formState: { errors },
    } = methods;

    const handleNext = async () => {
        // Only validate the fields mapped to the current step
        const fieldsToValidate = FORM_STEPS_FIELDS[currentStep];
        const isStepValid = await trigger(fieldsToValidate);

        if (isStepValid) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            notification.error({ message: "Kérjük, javítsa a hibákat a továbblépéshez." });
        }
    };

    const onSubmit = async (data: EventFormValues) => {
        setSubmitting(true);
        const formDataPayload = new FormData();

        Object.keys(data).forEach((key) => {
            let value = (data as any)[key];
            if (typeof value === "boolean") value = value ? "1" : "0";
            if (Array.isArray(value)) value = JSON.stringify(value);
            if (value !== undefined && value !== null) {
                formDataPayload.append(key, value);
            }
        });

        if (fileList.length > 0) formDataPayload.append("eventFilePath", fileList[0]);

        // try {
        //     await axiosClient.post("/validate-form", formDataPayload);
        //     const res = await axiosClient.post("/send-code", { email: data.eventOrganizerEmail });
        //     notification.success({ message: "Kód elküldve", description: res.data.message });

        //     // NOTE: Here you would trigger your verification flow.
        //     // setVerifycationModalOpen(true);
        // } catch (err: any) {
        //     notification.error({ message: "Hiba történt a beküldéskor" });
        // } finally {
        //     setSubmitting(false);
        // }
    };

    return (
        <FormProvider {...methods}>
            <div className="mx-auto max-w-4xl bg-white p-6 shadow-lg sm:rounded-xl">
                {/* HEADER */}
                <div className="mb-8 border-b pb-4">
                    <Title level={3}>Rendezvény bejelentő</Title>
                    <Text type="secondary">Kérjük töltse ki a mezőket értelemszerűen.</Text>
                </div>

                {/* STEPPER UI */}
                <div className="relative mb-8 flex justify-between">
                    <div className="absolute top-1/2 left-0 -z-0 h-0.5 w-full -translate-y-1/2 bg-gray-200"></div>
                    {STEPS_LABELS.map((label, idx) => {
                        const isActive = currentStep === idx;
                        const isPast = currentStep > idx;

                        return (
                            <div key={idx} className="relative z-10 flex flex-col items-center bg-white px-2">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-all ${
                                        isActive
                                            ? "border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100"
                                            : isPast
                                              ? "border-green-500 bg-green-500 text-white"
                                              : "border-gray-300 bg-white text-gray-400"
                                    }`}
                                >
                                    {isPast ? <CheckOutlined /> : idx + 1}
                                </div>
                                <span className="mt-2 text-xs font-medium text-gray-600">{label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* FORM CONTENT */}
                <form onSubmit={handleSubmit(onSubmit)} className="min-h-[400px]">
                    {currentStep === 0 && <StepBasicInfo />}
                    {currentStep === 1 && <StepLogistics />}
                    {/* {currentStep === 2 && <StepOrganizer />} */}
                    {/* {currentStep === 3 && <StepLegal />} */}

                    {currentStep === 4 && (
                        <div className="flex flex-col items-center py-12">
                            <Title level={5}>Helyszínrajz feltöltése (Opcionális)</Title>
                            <Upload
                                beforeUpload={(file) => {
                                    setFileList([file]);
                                    return false;
                                }}
                                onRemove={() => setFileList([])}
                                maxCount={1}
                            >
                                <Button icon={<UploadOutlined />} size="large">
                                    Fájl kiválasztása
                                </Button>
                            </Upload>
                        </div>
                    )}

                    {/* FOOTER NAVIGATION */}
                    <div className="mt-8 flex justify-between border-t pt-6">
                        <Button size="large" onClick={() => setCurrentStep((prev) => prev - 1)} disabled={currentStep === 0}>
                            Előző
                        </Button>

                        {currentStep < 4 ? (
                            <Button type="primary" size="large" onClick={handleNext} className="bg-blue-600">
                                Következő
                            </Button>
                        ) : (
                            <Button type="primary" htmlType="submit" size="large" loading={submitting} className="bg-green-600">
                                Beküldés
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </FormProvider>
    );
};

export default EventFormPage;
