import NavBar from "../components/NavBar";
import { useDispatch } from "react-redux";
import { useSelector } from "../redux/store";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";
import { SetSidebarOpen } from "../redux/action/globalProps/setSidebarOpen";

const FamulusLayout = () => {
    const dispatch = useDispatch();
    const { sidebarOpen } = useSelector((state) => state.globalProps);
    return (
        <div className="bg-white-bg flex min-h-screen flex-col">
            <NavBar />
            <div className="relative flex w-full flex-1 flex-row">
                <div
                    className={`sidebar:hidden absolute inset-0 z-40 bg-black/70 transition-opacity duration-300 ${
                        sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                    }`}
                    onClick={() => dispatch(SetSidebarOpen(false))}
                ></div>
                <SideBar sidebarOpen={sidebarOpen} />
                <main className="w-full flex-1 px-4 pb-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default FamulusLayout;
