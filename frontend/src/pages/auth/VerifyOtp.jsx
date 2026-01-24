import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../main";
import { toast } from "react-toastify";
import { setAuth, setUser } from "../../redux/slices/authSlice";
import { setCSRFToken } from "../../apiIntercepter";
import { identifyUser } from "../../utils/analytics";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const email = localStorage.getItem("email");
    try {
      const { data } = await axios.post(
        `${server}/api/v1/verify`,
        { email, otp },
        { withCredentials: true }
      );

      if (data.sessionInfo?.csrfToken) {
        setCSRFToken(data.sessionInfo.csrfToken);
      }

      dispatch(setAuth(true));
      dispatch(setUser(data.user));
      
      if (data.user) {
        identifyUser(data.user._id, {
          email: data.user.email,
          name: data.user.name
        });
      }
      
      localStorage.removeItem("email");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-md p-4 transition-opacity duration-300">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-xl shadow-2xl p-8">

          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Verify OTP
          </h2>

          <p className="text-gray-600 font-bold text-center mb-6">
            Enter the code sent to your email
          </p>

          <form onSubmit={submitHandler}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                One-Time Password
              </label>
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full font-semibold px-4 py-3 border rounded-lg focus:ring-[#387ED1] focus:border-[#387ED1] text-center text-xl tracking-widest"
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={btnLoading}
              className="w-full py-3 cursor-pointer bg-[#387ED1] text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            >
              {btnLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link
              to="/login"
              className="text-gray-600 cursor-pointer hover:text-[#387ED1] font-semibold"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;