import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const AppLayout = () => {
    return (
        <>
            <Navbar />
            <div>
                <Outlet />
            </div>
        </>
    );
};

export default AppLayout;