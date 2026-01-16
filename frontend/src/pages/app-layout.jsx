import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const AppLayout = () => {
    const [onAuthClick, setOnAuthClick] = useState(null);

    return (
        <>
            <Navbar onAuthClick={onAuthClick} />
            <div>
                <Outlet context={{ setOnAuthClick }} />
            </div>
        </>
    );
};

export default AppLayout;