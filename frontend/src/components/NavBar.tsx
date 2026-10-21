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
import { readAllNotifications } from "../actions/readAllNotifications";

const VISIBLE_NOTIFICATION_LIMIT = 20;

const NavBar = () => {
    const user = useSessionUser();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sidebarOpen } = useSelector((state) => state.globalProps);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [readAllLoading, setReadAllLoading] = useState(false);
    const notificationsRef = useRef<HTMLDivElement | null>(null);
    const notifications = useMemo(() => user.notifications ?? [], [user.notifications]);
    const visibleNotifications = useMemo(() => notifications.slice(0, VISIBLE_NOTIFICATION_LIMIT), [notifications]);
    const hiddenNotificationsCount = Math.max(notifications.length - visibleNotifications.length, 0);
    const hasUnreadNotifications = notifications.some((notification) => !notification.read_at);

    const handleLogout = async () => {
        await logout();
    };

    const handleNotificationClick = (eventId: number) => {
        setNotificationsOpen(false);
        navigate(`/datasheet/${eventId}`);
    };

    const handleReadAllNotifications = async () => {
        if (readAllLoading || !hasUnreadNotifications) return;

        setReadAllLoading(true);
        const success = await readAllNotifications();
        setReadAllLoading(false);

        if (success) {
            setNotificationsOpen(false);
        }
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
        <div className="mobile:min-h-[80px] mobile:px-5 mobile:py-3 flex min-h-[64px] w-full min-w-0 flex-row items-center justify-between gap-2 px-3 py-2">
            {/* LEFT SIDE */}
            <div className="mobile:gap-4 flex min-w-0 flex-row items-center gap-1">
                <div className="flex min-w-0 flex-row items-center gap-4">
                    <img src="/sze_logo_landscape.png" alt="Sze logó" className="mobile:w-[150px] aspect-[3/1] w-[92px] flex-shrink-0" />
                </div>
                <button
                    className="z-50 flex h-10 w-10 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-1"
                    onClick={() => dispatch(SetSidebarOpen(!sidebarOpen))}
                    aria-label={sidebarOpen ? "Menü zárása" : "Menü nyitása"}
                >
                    <span className="bg-dark block h-0.5 w-6 -translate-y-0.5 rounded-lg transition-all duration-300 ease-out" />
                    <span className="bg-dark block h-0.5 w-6 rounded-lg transition-all duration-300 ease-out" />
                    <span className="bg-dark block h-0.5 w-6 translate-y-0.5 rounded-lg transition-all duration-300 ease-out" />
                </button>
                <button
                    className="text-dark flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center"
                    onClick={() => navigate(-1)}
                    aria-label="Vissza az előző oldalra"
                >
                    <ArrowLeft size={22} />
                </button>
            </div>
            <h1 className="tablet:block hidden text-[17px] font-semibold">Egyetemi Rendezvényadminisztrációs Platform</h1>
            {/* RIGHT SIDE */}
            <div className="mobile:gap-3 tablet:gap-4 flex min-w-0 flex-row items-center justify-end gap-1">
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
                        <div className="mobile:absolute mobile:top-12 mobile:right-0 mobile:left-auto mobile:w-[min(360px,calc(100vw-32px))] fixed top-[58px] right-3 left-3 z-50 overflow-hidden rounded-lg border border-[#3e484c]/10 bg-white shadow-[0_16px_40px_rgba(62,72,76,0.14)]">
                            <div className="border-b border-[#3e484c]/10 px-4 py-3">
                                <h2 className="text-dark text-sm leading-[100%] font-semibold">Értesítések</h2>
                            </div>

                            {notifications.length > 0 ? (
                                <div className="max-h-[360px] overflow-y-auto">
                                    {visibleNotifications.map((notification) => (
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
                                                <span className="text-dark block truncate text-sm font-medium">
                                                    {notification.event_name}
                                                </span>
                                                <span className="text-dark/70 mt-1 block text-xs leading-5">{notification.message}</span>
                                                <span className="mt-1 block text-[11px] text-[#3e484c]/45">
                                                    {formatTime(notification.created_at)}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                    {hiddenNotificationsCount > 0 && (
                                        <div className="border-t border-[#3e484c]/10 px-4 py-3 text-center text-xs text-[#3e484c]/55">
                                            További {hiddenNotificationsCount} értesítés nem jelenik meg.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="px-4 py-6 text-center text-sm text-[#3e484c]/55">Nincs új értesítés.</div>
                            )}

                            <div className="border-t border-[#3e484c]/10 bg-white px-4 py-3">
                                <button
                                    className="bg-primary-light hover:bg-primary flex w-full cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-[#3e484c]/20 disabled:text-[#3e484c]/45"
                                    onClick={handleReadAllNotifications}
                                    disabled={!hasUnreadNotifications || readAllLoading}
                                >
                                    {readAllLoading ? "Megjelölés..." : "Összes megjelölése olvasottként"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex min-w-0 flex-row items-center gap-2">
                    <img
                        src={user.picture}
                        alt="Picture"
                        className="mobile:h-10 mobile:w-10 h-9 w-9 flex-shrink-0 rounded-full object-cover"
                    />
                    <div className="tablet:flex hidden max-w-[220px] min-w-0 flex-col gap-1">
                        <h2 className="truncate leading-[100%] font-medium">{user.name}</h2>
                        <p className="truncate leading-[100%]">{user.roleName}</p>
                    </div>
                </div>
                <button
                    className="text-primary-light mobile:w-auto mobile:rounded-none mobile:px-0 flex h-10 w-10 flex-shrink-0 cursor-pointer flex-row items-center justify-center gap-2 rounded-full transition-colors hover:bg-[#3e484c]/5"
                    onClick={handleLogout}
                    aria-label="Kijelentkezés"
                    title="Kijelentkezés"
                >
                    <span className="mobile:block hidden">Kijelentkezés</span>
                    <LogOut className="mobile:w-4 w-6" />
                </button>
            </div>
        </div>
    );
};

export default NavBar;
