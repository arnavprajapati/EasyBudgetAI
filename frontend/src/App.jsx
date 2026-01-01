import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppLayout from "./pages/app-layout";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import Settings from "./pages/Settings";
import Loading from "./Loding";
import { fetchUser } from "./redux/slices/authSlice";

const AppContent = () => {
  const { isAuth, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const router = createBrowserRouter([
    {
      path: "/login",
      element: !isAuth ? <Login /> : <Navigate to="/" replace />
    },
    {
      path: "/register",
      element: !isAuth ? <Register /> : <Navigate to="/" replace />
    },
    {
      path: "/verifyotp",
      element: !isAuth ? <VerifyOtp /> : <Navigate to="/" replace />
    },
    {
      path: "/token/:token",
      element: !isAuth ? <Verify /> : <Navigate to="/" replace />
    },
    {
      element: <AppLayout />,
      children: [
        {
          path: "/",
          element: isAuth ? <Home /> : <LandingPage />
        },
        {
          path: "/home",
          element: isAuth ? <Home /> : <Navigate to="/login" replace />
        },
        {
          path: "/settings",
          element: isAuth ? <Settings /> : <Navigate to="/login" replace />
        }
      ]
    }
  ]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;