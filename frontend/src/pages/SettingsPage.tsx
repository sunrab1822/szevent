import { useEffect, useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { setPicture } from "../actions/setPicture";
import { showActionError, showActionSuccess } from "../utils/actionFeedback";
import { useSessionUser } from "../utils/useSessionUser";

const SettingsPage = () => {
    const user = useSessionUser();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

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
        setSelectedFile(file);
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
                    Itt frissítheti a fiókjához tartozó profilképet. A feltöltött kép a felhasználói felületen mindenhol meg fog jelenni.
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
                            <p className="mt-1 text-sm text-[#3e484c]/60">Válasszon egy új képet, majd mentse el a módosítást.</p>
                        </div>

                        <div className="rounded-xl border border-dashed border-[#3e484c]/15 bg-[#f8fafb] p-5">
                            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
