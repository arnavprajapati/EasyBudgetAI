import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../main";
import { toast } from "react-toastify";
import { setAuth, setUser } from "../../redux/slices/authSlice";

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

      toast.success(data.message);
      dispatch(setAuth(true));
      dispatch(setUser(data.user));
      localStorage.removeItem("email");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#387ED1] to-[#2868b8] rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h2>
            <p className="text-gray-600">Enter the code sent to your email</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Password
              </label>
              <input
                type="number"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#387ED1] focus:border-transparent outline-none transition-all duration-200 text-center text-2xl tracking-widest"
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={btnLoading}
              className="w-full bg-gradient-to-r from-[#387ED1] to-[#2868b8] hover:from-[#2868b8] hover:to-[#1d5299] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {btnLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Back to{" "}
              <Link to="/login" className="text-[#387ED1] hover:text-[#2868b8] font-semibold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;