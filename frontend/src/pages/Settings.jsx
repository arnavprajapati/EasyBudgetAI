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

    // OTP verification states
    const [otpInput, setOtpInput] = useState("");
    const [verifyingOTP, setVerifyingOTP] = useState(false);
    const [otpError, setOtpError] = useState("");

    useEffect(() => {
        dispatch(fetchTelegramStatus());
    }, [dispatch]);

    // Extract username from URL or @ symbol
    const extractUsername = (input) => {
        const trimmed = input.trim();

        const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:t\.me|telegram\.me)\/(@?)([a-zA-Z0-9_]{5,32})/i);
        if (urlMatch) {
            return urlMatch[2];
        }

        return trimmed.replace(/^@/, "");
    };

    // Validate username format
    const validateUsername = (username) => {
        const usernameRegex = /^[a-zA-Z0-9_]{5,32}$/;
        return usernameRegex.test(username);
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setInputUsername(value);
        setUsernameError("");

        if (value.trim()) {
            const extracted = extractUsername(value);

            if (!validateUsername(extracted)) {
                setUsernameError("Username must be 5-32 characters (letters, numbers, underscores only)");
            }
        }
    };

    const handleGenerateOTP = async () => {
        const extracted = extractUsername(inputUsername);

        if (!extracted) {
            setUsernameError("Please enter your Telegram username");
            return;
        }

        if (!validateUsername(extracted)) {
            setUsernameError("Invalid username format");
            return;
        }

        setGeneratingOTP(true);
        setUsernameError("");

        try {
            await dispatch(generateTelegramOTP(extracted)).unwrap();
            setOtpGenerated(true);
        } catch (error) {
            console.error("Failed to generate OTP:", error);
        } finally {
            setGeneratingOTP(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpInput.trim()) {
            setOtpError("Please enter the OTP");
            return;
        }

        if (!/^\d{6}$/.test(otpInput.trim())) {
            setOtpError("OTP must be 6 digits");
            return;
        }

        setVerifyingOTP(true);
        setOtpError("");

        try {
            await dispatch(verifyTelegramOTP(otpInput.trim())).unwrap();
            toast.success("Account linked successfully! Now send the OTP to your Telegram bot to complete.");
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
                                {user && (
                                    <p className="text-gray-600">
                                        Manage your account and preferences
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => navigate("/")}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                ← Back
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-br from-[#387ED1] to-[#2868b8] rounded-full p-3 mr-4">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Telegram Integration
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    Link your Telegram account to receive notifications directly.
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#387ED1]"></div>
                            </div>
                        ) : linked ? (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-3">
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                                                <span className="text-white text-sm">✓</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-green-800">
                                                Telegram Connected
                                            </h3>
                                        </div>
                                        <div className="space-y-2 text-sm text-green-700">
                                            <p>
                                                <span className="font-medium">Username:</span> @
                                                {telegramUsername || "N/A"}
                                            </p>
                                            {telegramLinkedAt && (
                                                <p>
                                                    <span className="font-medium">Linked on:</span>{" "}
                                                    {new Date(telegramLinkedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleUnlink}
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                                    >
                                        Unlink
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Not Connected
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm">
                                    Link your Telegram account to receive instant notifications.
                                </p>
                                <button
                                    onClick={() => setShowLinkModal(true)}
                                    className="bg-gradient-to-r from-[#387ED1] to-[#2868b8] hover:from-[#2868b8] hover:to-[#1d5299] text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Link Telegram Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showLinkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-br from-[#387ED1] to-[#2868b8] rounded-full p-3 mr-4">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Link Telegram Account
                            </h2>
                        </div>

                        {!otpGenerated ? (
                            <>
                                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                                    <div className="flex items-start mb-4">
                                        <div className="bg-[#387ED1] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 mb-2">
                                                Enter Your Telegram Username
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Enter username, @username, or t.me link
                                            </p>
                                            <input
                                                type="text"
                                                value={inputUsername}
                                                onChange={handleUsernameChange}
                                                placeholder="arnav_31_06"
                                                className={`w-full px-4 py-3 rounded-lg border ${usernameError ? 'border-red-300' : 'border-gray-300'
                                                    } focus:ring-2 focus:ring-[#387ED1] outline-none`}
                                            />
                                            {usernameError && (
                                                <p className="text-xs text-red-600 mt-2">{usernameError}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={resetModal}
                                        className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleGenerateOTP}
                                        disabled={!inputUsername.trim() || generatingOTP || usernameError}
                                        className="bg-gradient-to-r from-[#387ED1] to-[#2868b8] text-white font-semibold px-6 py-3 rounded-lg shadow-lg disabled:opacity-50"
                                    >
                                        {generatingOTP ? "Generating..." : "Generate OTP"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-2">✅</span>
                                            <p className="text-sm text-green-800 font-semibold">
                                                OTP Generated! Check your Telegram bot.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-6">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                            <span className="text-2xl mr-2">📱</span>
                                            Get Your OTP from Telegram
                                        </h3>
                                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                                            <div className="flex items-start">
                                                <span className="bg-[#387ED1] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">1</span>
                                                <p>Open Telegram and search for <strong>{botUsername || "@smart_khata_bot"}</strong></p>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="bg-[#387ED1] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">2</span>
                                                <p>Send <strong>/start</strong> to the bot</p>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="bg-[#387ED1] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">3</span>
                                                <p>Bot will send you a 6-digit OTP</p>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="bg-[#387ED1] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">4</span>
                                                <p><strong>Copy the OTP</strong> and paste it below</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={openTelegramBot}
                                            className="w-full bg-[#387ED1] hover:bg-[#2868b8] text-white font-semibold px-4 py-3 rounded-lg flex items-center justify-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                                            </svg>
                                            Open Telegram Bot
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-xl p-6 border-2 border-[#387ED1]">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <span className="text-2xl mr-2">🔐</span>
                                            Enter OTP Here
                                        </h3>
                                        <input
                                            type="text"
                                            value={otpInput}
                                            onChange={(e) => {
                                                setOtpInput(e.target.value);
                                                setOtpError("");
                                            }}
                                            placeholder="000000"
                                            maxLength={6}
                                            className={`w-full px-4 py-4 rounded-lg border-2 ${otpError ? 'border-red-300' : 'border-gray-300'
                                                } focus:ring-2 focus:ring-[#387ED1] outline-none text-center text-2xl font-mono tracking-widest`}
                                        />
                                        {otpError && (
                                            <p className="text-sm text-red-600 mt-2 text-center">{otpError}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            Enter the 6-digit code from Telegram
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            onClick={resetModal}
                                            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleVerifyOTP}
                                            disabled={!otpInput.trim() || verifyingOTP}
                                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg disabled:opacity-50"
                                        >
                                            {verifyingOTP ? "Verifying..." : "Verify & Link"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;