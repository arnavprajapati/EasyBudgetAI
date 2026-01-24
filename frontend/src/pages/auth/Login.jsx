import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../main";
import { X } from "lucide-react";
import analytics from "../../utils/analytics";
import GoogleSignInButton from "./GoogleSignInButton";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    analytics.pageView('Login');
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/login`, {
        email,
        password,
      });
      toast.success(data.message);
      analytics.login('email');
      localStorage.setItem("email", email);
      navigate("/verifyotp");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-sm w-full relative">
        <div className="bg-white rounded-xl shadow-2xl p-8 relative">

          <button
            onClick={() => navigate("/")}
            className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Log In
          </h2>

          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full font-semibold px-4 py-2 border rounded-lg focus:ring-[#387ED1] focus:border-[#387ED1]"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full font-semibold px-4 py-2 border rounded-lg focus:ring-[#387ED1] focus:border-[#387ED1]"
                required
              />
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-600 cursor-pointer hover:text-[#387ED1] font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={btnLoading}
              className="w-full py-3 cursor-pointer bg-[#387ED1] text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            >
              {btnLoading ? 'Processing...' : 'Login'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <GoogleSignInButton />

          <div className="mt-4 text-center text-sm">
            <Link
              to="/register"
              className="text-gray-600 cursor-pointer hover:text-[#387ED1] font-semibold"
            >
              Don't have an account? Register here.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;