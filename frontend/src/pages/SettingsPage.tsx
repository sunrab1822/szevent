import { useEffect, useMemo, useRef, useState } from "react";
import { Switch } from "antd";
import { Upload } from "lucide-react";
import { setPicture } from "../actions/setPicture";
import { setNotificationEmailPreference } from "../actions/setNotificationEmailPreference";
import { showActionError, showActionSuccess } from "../utils/actionFeedback";
import { useSessionUser } from "../utils/useSessionUser";

const acceptedImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const acceptedImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const maxProfilePictureSize = 5 * 1024 * 1024;

const isValidProfilePicture = (file: File) => {
    const fileName = file.name.toLowerCase();
    const hasAcceptedExtension = acceptedImageExtensions.some((extension) => fileName.endsWith(extension));
    const hasAcceptedMimeType = acceptedImageMimeTypes.includes(file.type);

    return hasAcceptedExtension && hasAcceptedMimeType && file.size <= maxProfilePictureSize;
};

const SettingsPage = () => {
    const user = useSessionUser();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(user.email_notifications ?? false);
    const [emailNotificationSaving, setEmailNotificationSaving] = useState(false);

    useEffect(() => {
        setEmailNotificationsEnabled(user.email_notifications ?? false);
    }, [user.email_notifications]);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const displayedImage = useMemo(() => previewUrl ?? user.picture, [previewUrl, user.picture]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!isValidProfilePicture(file)) {
            setSelectedFile(null);
            event.target.value = "";
            showActionError("Csak JPG, PNG, WEBP vagy GIF kép tölthető fel, legfeljebb 5 MB méretben.");
            return;
        }

        setSelectedFile(file);
    };

    const handleEmailNotificationChange = async (checked: boolean) => {
        if (emailNotificationSaving) return;

        const previousValue = emailNotificationsEnabled;
        setEmailNotificationsEnabled(checked);
        setEmailNotificationSaving(true);

        try {
            const success = await setNotificationEmailPreference(checked);

            if (!success) {
                setEmailNotificationsEnabled(previousValue);
                showActionError("Az e-mail értesítési beállítás mentése nem sikerült.");
                return;
            }

            showActionSuccess("Az e-mail értesítési beállítás frissítve.");
        } finally {
            setEmailNotificationSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile || saving) return;

        setSaving(true);
        try {
            const success = await setPicture(selectedFile);
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("Profilkép sikeresen frissítve.");
            setSelectedFile(null);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="text-[#3e484c]">
                <h1 className="text-2xl font-bold">Beállítások</h1>
                <p className="mt-0.5 max-w-2xl text-sm text-[#3e484c]/60">
                    Itt frissítheti a fiókjához tartozó profilképet és az értesítési beállításait.
                </p>
            </div>

            <div className="overflow-hidden rounded-md border border-[#3e484c]/10 bg-white shadow-sm">
                <div className="flex flex-col gap-8 p-6 lg:flex-row lg:items-start">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <img
                                src={displayedImage}
                                alt={user.displayName || user.name}
                                className="h-36 w-36 rounded-2xl object-cover shadow-sm"
                            />
                            {/* <div className="bg-primary-light absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm">
                                <Camera size={17} />
                            </div> */}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-[#3e484c]">{user.displayName || user.name}</p>
                            <p className="text-xs text-[#3e484c]/50">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-5">
                        <div>
                            <h2 className="text-[13px] font-bold tracking-widest text-[#3e484c] uppercase">Profilkép feltöltése</h2>
                            <p className="mt-1 text-sm text-[#3e484c]/60">
                                Válasszon egy új JPG, PNG, WEBP vagy GIF képet, majd mentse el a módosítást.
                            </p>
                        </div>

                        <div className="rounded-xl border border-dashed border-[#3e484c]/15 bg-[#f8fafb] p-5">
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-[#3e484c]">Kiválasztott fájl</p>
                                    <p className="min-h-6 text-sm text-[#3e484c]/60">
                                        {selectedFile ? selectedFile.name : "Még nincs kiválasztott kép."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => inputRef.current?.click()}
                                        className="flex cursor-pointer items-center gap-2 rounded-md border border-[#3e484c]/15 bg-white px-4 py-2 text-sm font-medium text-[#3e484c] transition-colors hover:bg-gray-50"
                                    >
                                        <Upload size={16} />
                                        Kép kiválasztása
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!selectedFile || saving}
                                        className="bg-primary-light hover:bg-primary-light/80 disabled:bg-primary-light/30 flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
                                    >
                                        {saving ? "Mentés..." : "Profilkép mentése"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#3e484c]/10 bg-[#f8fafb] p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <h2 className="text-[13px] font-bold tracking-widest text-[#3e484c] uppercase">E-mail értesítések</h2>
                                    <p className="mt-1 text-sm text-[#3e484c]/60">
                                        E-mailt is kérek, ha egy esemény értesítést kap a rendszerben.
                                    </p>
                                </div>
                                <Switch
                                    checked={emailNotificationsEnabled}
                                    loading={emailNotificationSaving}
                                    onChange={handleEmailNotificationChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
