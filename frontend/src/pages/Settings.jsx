import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    fetchTelegramStatus,
    generateTelegramOTP,
    verifyTelegramOTP,
    unlinkTelegram,
} from "../redux/slices/telegramSlice";
import { toast } from "react-toastify";
import { ArrowLeft, Send, MessageSquare, AlertCircle, Unlink, CheckCircle2 } from "lucide-react";

const Settings = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { linked, telegramUsername, telegramLinkedAt, loading, botUsername } =
        useSelector((state) => state.telegram);

    const [showLinkModal, setShowLinkModal] = useState(false);
    const [inputUsername, setInputUsername] = useState("");
    const [generatingOTP, setGeneratingOTP] = useState(false);
    const [otpGenerated, setOtpGenerated] = useState(false);
    const [usernameError, setUsernameError] = useState("");

    const [otpInput, setOtpInput] = useState("");
    const [verifyingOTP, setVerifyingOTP] = useState(false);
    const [otpError, setOtpError] = useState("");

    useEffect(() => {
        dispatch(fetchTelegramStatus());
    }, [dispatch]);

    const extractUsername = (input) => {
        const trimmed = input.trim();
        const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:t\.me|telegram\.me)\/(@?)([a-zA-Z0-9_]{5,32})/i);
        return urlMatch ? urlMatch[2] : trimmed.replace(/^@/, "");
    };

    const validateUsername = (username) => /^[a-zA-Z0-9_]{5,32}$/.test(username);

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setInputUsername(value);
        setUsernameError("");
        if (value.trim()) {
            const extracted = extractUsername(value);
            if (!validateUsername(extracted)) {
                setUsernameError("Invalid username format");
            }
        }
    };

    const handleGenerateOTP = async () => {
        const extracted = extractUsername(inputUsername);
        if (!extracted || !validateUsername(extracted)) {
            setUsernameError("Please enter a valid Telegram username");
            return;
        }

        setGeneratingOTP(true);
        try {
            await dispatch(generateTelegramOTP(extracted)).unwrap();
            setOtpGenerated(true);
        } catch (error) {
            toast.error("Failed to generate OTP");
        } finally {
            setGeneratingOTP(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!/^\d{6}$/.test(otpInput.trim())) {
            setOtpError("OTP must be 6 digits");
            return;
        }

        setVerifyingOTP(true);
        try {
            await dispatch(verifyTelegramOTP(otpInput.trim())).unwrap();
            toast.info("Account linked! Now paste the code in Telegram.", {
                position: "top-center",
                autoClose: 8000,
                icon: <Send size={20} color="#387ED1" />,
                progressStyle: { background: "#387ED1" },
            });
            resetModal();
            dispatch(fetchTelegramStatus());
        } catch (error) {
            setOtpError(error || "Failed to verify OTP");
        } finally {
            setVerifyingOTP(false);
        }
    };

    const handleUnlink = async () => {
        if (window.confirm("Are you sure you want to unlink your Telegram account?")) {
            await dispatch(unlinkTelegram());
            dispatch(fetchTelegramStatus());
        }
    };

    const openTelegramBot = () => {
        const botName = botUsername?.replace("@", "") || "smart_khata_bot";
        window.open(`https://t.me/${botName}`, "_blank");
    };

    const resetModal = () => {
        setShowLinkModal(false);
        setInputUsername("");
        setOtpGenerated(false);
        setUsernameError("");
        setOtpInput("");
        setOtpError("");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                        <p className="text-gray-500 text-sm font-bold">Manage your account and preferences</p>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={20} /> Back
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                        <div className="bg-[#387ED1] p-3 rounded-full">
                            <Send size={24} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Telegram Integration</h2>
                    </div>

                    <div className="p-8">
                        {loading ? (
                            <div className="flex justify-center py-4 text-[#387ED1]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                            </div>
                        ) : linked ? (
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <CheckCircle2 className="text-green-500" size={32} />
                                    <div>
                                        <p className="text-green-800 font-bold">Telegram Connected</p>
                                        <p className="text-green-700 text-sm font-bold">@{telegramUsername}</p>
                                    </div>
                                </div>
                                <button onClick={handleUnlink} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer">
                                    <Unlink size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-600 font-bold mb-6 italic">Receive instant notifications directly on your Telegram.</p>
                                <button
                                    onClick={() => setShowLinkModal(true)}
                                    className="bg-[#387ED1] hover:bg-blue-700 text-white font-bold px-10 py-3 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-blue-100"
                                >
                                    Link Telegram Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                        <button onClick={resetModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 cursor-pointer">
                            <ArrowLeft size={24} className="rotate-90" />
                        </button>

                        {!otpGenerated ? (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-800">Enter Username</h2>
                                    <p className="text-sm text-gray-500 font-bold mt-1">We'll send a code to your account</p>
                                </div>
                                <input
                                    type="text"
                                    value={inputUsername}
                                    onChange={handleUsernameChange}
                                    placeholder="@arnav_31_06"
                                    className={`w-full font-bold px-4 py-4 rounded-xl border-2 ${usernameError ? 'border-red-300' : 'border-gray-100'} bg-gray-50 focus:border-[#387ED1] focus:bg-white outline-none transition-all`}
                                />
                                <button
                                    onClick={handleGenerateOTP}
                                    disabled={!inputUsername.trim() || generatingOTP || usernameError}
                                    className="w-full bg-[#387ED1] cursor-pointer py-4 rounded-xl text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                    {generatingOTP ? "Processing..." : "Generate OTP"}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                        <MessageSquare className="text-[#387ED1]" size={32} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">Verify Account</h2>
                                    <p className="text-sm text-gray-500 font-bold">Check your bot for the 6-digit code</p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <button
                                        onClick={openTelegramBot}
                                        className="w-full bg-white text-[#387ED1] py-2 rounded-lg font-bold text-sm shadow-sm border border-blue-200 cursor-pointer"
                                    >
                                        Open Telegram Bot
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    value={otpInput}
                                    onChange={(e) => { setOtpInput(e.target.value); setOtpError(""); }}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-full text-center text-3xl tracking-[0.4em] font-mono py-4 rounded-xl border-2 border-blue-100 bg-blue-50/30 focus:border-[#387ED1] outline-none transition-all text-[#387ED1]"
                                />

                                <div className="space-y-3">
                                    <button
                                        onClick={handleVerifyOTP}
                                        disabled={!otpInput.trim() || verifyingOTP}
                                        className="w-full bg-[#387ED1] cursor-pointer py-4 rounded-xl text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
                                    >
                                        {verifyingOTP ? "Verifying..." : "Verify & Continue"}
                                    </button>

                                    <div className="flex gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                        <AlertCircle size={16} className="text-[#387ED1] shrink-0 mt-0.5" />
                                        <p className="text-[14px] text-[#387ED1] font-bold leading-tight">
                                            <span className="text-red-500">IMPORTANT:</span> After clicking verify, make sure to paste this exact code in the Telegram bot chat to finish.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;