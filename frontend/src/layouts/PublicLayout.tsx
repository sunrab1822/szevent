import { LogIn } from "lucide-react";
import { Outlet } from "react-router-dom";
import { login } from "../actions/login";

const PublicLayout = () => {
    const handleLogin = async () => {
        await login();
    };
    return (
        <div className="bg-white-bg flex min-h-screen flex-col">
            <div className="flex h-[80px] flex-row items-center justify-between px-5 py-3">
                <div className="flex flex-row items-center gap-4">
                    <div className="flex flex-row items-center gap-4">
                        <img src="/logo.svg" alt="Sze logó" className="aspect-square w-[40px]" />
                        <h1 className="mobile:block hidden text-[20px] font-semibold">SzeEvent</h1>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-4">
                    <button className="text-primary-light flex cursor-pointer flex-row items-center gap-2" onClick={handleLogin}>
                        <span className="mobile:block hidden">Bejelentkezés</span>
                        <LogIn className="mobile:w-4 w-6" />
                    </button>
                </div>
            </div>
            <div className="relative flex w-full flex-1 flex-row">
                <main className="w-full flex-1 px-4 pb-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PublicLayout;
