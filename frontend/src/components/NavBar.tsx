import { LogOut } from "lucide-react";
import { useSessionUser } from "../utils/useSessionUser";
import { logout } from "../actions/logout";
import { useSelector } from "../redux/store";
import { useDispatch } from "react-redux";
import { SetSidebarOpen } from "../redux/action/globalProps/setSidebarOpen";

const NavBar = () => {
    const user = useSessionUser();
    const dispatch = useDispatch();
    const { sidebarOpen } = useSelector((state) => state.globalProps);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="flex h-[80px] flex-row items-center justify-between px-5 py-3">
            {/* LEFT SIDE */}
            <div className="flex flex-row items-center gap-4">
                <div className="flex flex-row items-center gap-4">
                    <img src="/sze_logo_landscape.png" alt="Sze logó" className="aspect-[3/1] max-w-[150px]" />
                </div>
                <button
                    className="z-50 flex h-8 w-8 cursor-pointer flex-col items-center justify-center gap-1"
                    onClick={() => dispatch(SetSidebarOpen(!sidebarOpen))}
                    aria-label={sidebarOpen ? "Menü zárása" : "Menü nyitása"}
                >
                    <span
                        className={`bg-dark block h-0.5 w-6 rounded-lg transition-all duration-300 ease-out ${sidebarOpen ? "translate-y-1.5 rotate-45" : "-translate-y-0.5"}`}
                    />
                    <span
                        className={`bg-dark block h-0.5 w-6 rounded-lg transition-all duration-300 ease-out ${sidebarOpen ? "opacity-0" : "opacity-100"}`}
                    />
                    <span
                        className={`bg-dark block h-0.5 w-6 rounded-lg transition-all duration-300 ease-out ${sidebarOpen ? "-translate-y-1.5 -rotate-45" : "translate-y-0.5"}`}
                    />
                </button>
            </div>
            <h1 className="tablet:block hidden text-[17px] font-semibold">Egyetemi Rendezvényadminisztrációs Platform</h1>
            {/* RIGHT SIDE */}
            <div className="flex flex-row items-center gap-4">
                <div className="flex flex-row items-center gap-2">
                    <img src={user.picture} alt="Picture" className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
                    <div className="flex flex-col gap-1">
                        <h2 className="leading-[100%] font-medium">{user.name}</h2>
                        <p className="leading-[100%]">{user.roleName}</p>
                    </div>
                </div>
                <button className="text-primary-light flex cursor-pointer flex-row items-center gap-2" onClick={handleLogout}>
                    <span className="mobile:block hidden">Kijelentkezés</span>
                    <LogOut className="mobile:w-4 w-6" />
                </button>
            </div>
        </div>
    );
};

export default NavBar;
