import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bell, LogOut } from "lucide-react";
import { useSessionUser } from "../utils/useSessionUser";
import { logout } from "../actions/logout";
import { useSelector } from "../redux/store";
import { useDispatch } from "react-redux";
import { SetSidebarOpen } from "../redux/action/globalProps/setSidebarOpen";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../utils/formatTime";
import { authenticate } from "../actions/authenticate";

const NavBar = () => {
    const user = useSessionUser();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sidebarOpen } = useSelector((state) => state.globalProps);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement | null>(null);
    const notifications = useMemo(() => user.notifications ?? [], [user.notifications]);
    const hasUnreadNotifications = notifications.some((notification) => !notification.read_at);

    const handleLogout = async () => {
        await logout();
    };

    const handleNotificationClick = (eventId: number) => {
        setNotificationsOpen(false);
        navigate(`/datasheet/${eventId}`);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!notificationsRef.current?.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const refreshNotifications = () => {
            authenticate();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                refreshNotifications();
            }
        };

        refreshNotifications();
        window.addEventListener("focus", refreshNotifications);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        const intervalId = window.setInterval(refreshNotifications, 60000);

        return () => {
            window.removeEventListener("focus", refreshNotifications);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.clearInterval(intervalId);
        };
    }, []);

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
                    <span className="bg-dark block h-0.5 w-6 -translate-y-0.5 rounded-lg transition-all duration-300 ease-out" />
                    <span className="bg-dark block h-0.5 w-6 rounded-lg transition-all duration-300 ease-out" />
                    <span className="bg-dark block h-0.5 w-6 translate-y-0.5 rounded-lg transition-all duration-300 ease-out" />
                </button>
                <button
                    className="text-dark flex h-8 w-8 cursor-pointer items-center justify-center"
                    onClick={() => navigate(-1)}
                    aria-label="Vissza az előző oldalra"
                >
                    <ArrowLeft size={22} />
                </button>
            </div>
            <h1 className="tablet:block hidden text-[17px] font-semibold">Egyetemi Rendezvényadminisztrációs Platform</h1>
            {/* RIGHT SIDE */}
            <div className="flex flex-row items-center gap-4">
                <div className="relative" ref={notificationsRef}>
                    <button
                        className="text-dark hover:text-primary-light relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors"
                        onClick={() => {
                            setNotificationsOpen((open) => !open);
                            authenticate();
                        }}
                        aria-label="Értesítések"
                        aria-expanded={notificationsOpen}
                    >
                        <Bell size={21} />
                        {hasUnreadNotifications && (
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                        )}
                    </button>

                    {notificationsOpen && (
                        <div className="absolute top-12 right-0 z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-lg border border-[#3e484c]/10 bg-white shadow-[0_16px_40px_rgba(62,72,76,0.14)]">
                            <div className="border-b border-[#3e484c]/10 px-4 py-3">
                                <h2 className="text-dark text-sm leading-[100%] font-semibold">Értesítések</h2>
                            </div>

                            {notifications.length > 0 ? (
                                <div className="max-h-[360px] overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            className="flex w-full cursor-pointer flex-row gap-3 border-b border-[#3e484c]/10 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#3e484c]/5"
                                            onClick={() => handleNotificationClick(notification.event_id)}
                                        >
                                            <span
                                                className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                                                    notification.read_at ? "bg-[#3e484c]/20" : "bg-red-500"
                                                }`}
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="text-dark block truncate text-sm font-medium">{notification.event_name}</span>
                                                <span className="text-dark/70 mt-1 block text-xs leading-5">{notification.message}</span>
                                                <span className="mt-1 block text-[11px] text-[#3e484c]/45">{formatTime(notification.created_at)}</span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-6 text-center text-sm text-[#3e484c]/55">Nincs új értesítés.</div>
                            )}
                        </div>
                    )}
                </div>
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
