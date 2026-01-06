import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../main";
import { X } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [btnLoading, setBtnLoading] = useState(false);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${server}/api/v1/forgot-password`, {
                email,
            });
            toast.success(data.message);
            setEmail("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
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
                        Forgot Password
                    </h2>

                    <p className="text-gray-600 font-bold text-center mb-6">
                        Enter your email to receive a reset link
                    </p>

                    <form onSubmit={submitHandler}>
                        <div className="mb-6">
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

                        <button
                            type="submit"
                            disabled={btnLoading}
                            className="w-full py-3 cursor-pointer bg-[#387ED1] text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
                        >
                            {btnLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
