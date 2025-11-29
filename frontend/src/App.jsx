import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import Loading from "./Loding";
import { fetchUser } from "./redux/slices/authSlice";

const App = () => {
  const { isAuth, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isAuth ? <Home /> : <Login />} />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            <Route
              path="/register"
              element={isAuth ? <Home /> : <Register />}
            />
            <Route
              path="/verifyotp"
              element={isAuth ? <Home /> : <VerifyOtp />}
            />
            <Route
              path="/token/:token"
              element={isAuth ? <Home /> : <Verify />}
            />
          </Routes>
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
        </BrowserRouter>
      )}
    </>
  );
};

export default App;