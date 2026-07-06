import { CalendarIcon, DollarSign, File, LayoutDashboardIcon, SettingsIcon, ShieldCheck } from "lucide-react";
import { useSessionUser } from "../utils/useSessionUser";
import { Link, useLocation } from "react-router-dom";
import type { JSX } from "react";
import { ROLES } from "../entitys/roles";

interface SideBarProps {
    sidebarOpen: boolean;
}

interface SideBarItemProps {
    name: string;
    path: string;
    icon: JSX.Element;
}

const SideBar = ({ sidebarOpen }: SideBarProps) => {
    const user = useSessionUser();
    let sideBarItems: SideBarItemProps[] = [];
    const location = useLocation();

    if (user.role === ROLES.ADMIN) {
        sideBarItems = [
            {
                name: "Irányítópult",
                path: "/",
                icon: <LayoutDashboardIcon />,
            },
            {
                name: "Rendezvények",
                path: "/events",
                icon: <CalendarIcon />,
            },
            {
                name: "Famulus Árlista",
                path: "/famulus-prices",
                icon: <DollarSign />,
            },
            {
                name: "Terem Árlista",
                path: "/room-prices",
                icon: <DollarSign />,
            },
            {
                name: "Szolgáltatás Árlista",
                path: "/service-prices",
                icon: <DollarSign />,
            },
            {
                name: "Felhasználók",
                path: "/users",
                icon: <ShieldCheck />,
            },
            {
                name: "Dokumentumok",
                path: "/documents",
                icon: <File />,
            },
            {
                name: "Beállítások",
                path: "/settings",
                icon: <SettingsIcon />,
            },
        ];
    } else if (user.role === ROLES.ORGANIZER) {
        sideBarItems = [
            {
                name: "Irányítópult",
                path: "/",
                icon: <LayoutDashboardIcon />,
            },
            {
                name: "Rendezvények",
                path: "/events",
                icon: <CalendarIcon />,
            },
            {
                name: "Beállítások",
                path: "/settings",
                icon: <SettingsIcon />,
            },
        ];
    } else if (user.role === ROLES.FAMULUS) {
        sideBarItems = [
            {
                name: "Irányítópult",
                path: "/",
                icon: <LayoutDashboardIcon />,
            },
            {
                name: "Rendezvények",
                path: "/events",
                icon: <CalendarIcon />,
            },
            {
                name: "Beállítások",
                path: "/settings",
                icon: <SettingsIcon />,
            },
        ];
    } else if (user.role === ROLES.LEGAL) {
        sideBarItems = [
            {
                name: "Irányítópult",
                path: "/",
                icon: <LayoutDashboardIcon />,
            },
            {
                name: "Rendezvények",
                path: "/events",
                icon: <CalendarIcon />,
            },
            {
                name: "Beállítások",
                path: "/settings",
                icon: <SettingsIcon />,
            },
        ];
    }

    return (
        <aside
            className={`sidebar:relative sidebar:z-auto absolute z-50 h-full overflow-hidden transition-all duration-500 ${sidebarOpen ? "w-[220px]" : "w-0"}`}
        >
            <div className="bg-white-bg flex h-full w-[220px] flex-col items-start gap-4 pt-4 pl-4">
                {sideBarItems.map((item, index) => (
                    <Link
                        to={item.path}
                        key={index}
                        className={`hover:text-primary-light flex cursor-pointer flex-row items-center gap-2 transition-all ${location.pathname === item.path ? "text-primary-light font-bold" : "text-dark"}`}
                    >
                        {item.icon} {item.name}
                    </Link>
                ))}
            </div>
        </aside>
    );
};

export default SideBar;
