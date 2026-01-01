import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const AppLayout = () => {
    return (
        <>
            <Navbar />
            <div className="mt-10">
                <Outlet />
            </div>
        </>
    );
};

export default AppLayout;