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
    const [needsToStartBot, setNeedsToStartBot] = useState(false);
    const [otpSentToTelegram, setOtpSentToTelegram] = useState(false);

    const [otpInput, setOtpInput] = useState("");
    const [verifyingOTP, setVerifyingOTP] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [linkVerified, setLinkVerified] = useState(false);

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
        setNeedsToStartBot(false);
        try {
            const result = await dispatch(generateTelegramOTP(extracted)).unwrap();
            setOtpGenerated(true);
            setOtpSentToTelegram(result.otpSentToTelegram);
            setNeedsToStartBot(result.needsToStartBot);
        } catch (error) {
            // toast.error("Failed to generate OTP");
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
            setOtpVerified(true);
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
        setNeedsToStartBot(false);
        setOtpSentToTelegram(false);
        setOtpVerified(false);
        setLinkVerified(false);
        dispatch(fetchTelegramStatus());
    };

    // Auto check if link is verified after OTP verification
    useEffect(() => {
        let interval;
        if (otpVerified && !linkVerified && !linked) {
            interval = setInterval(async () => {
                const result = await dispatch(fetchTelegramStatus());
                if (result.payload?.linked) {
                    setLinkVerified(true);
                    clearInterval(interval);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [otpVerified, linkVerified, linked, dispatch]);

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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#0088cc] to-[#00a2e8] px-8 py-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <Send size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Link Telegram</h2>
                                    <p className="text-white/70 text-base font-semibold">Get instant expense notifications</p>
                                </div>
                            </div>
                            <button onClick={resetModal} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 min-h-[320px]">
                            <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-r border-blue-100 flex flex-col items-center justify-center">
                                <div className="bg-white rounded-2xl p-5 shadow-lg border border-blue-100 mb-5">
                                    <img 
                                        src="/telegram-qr.png" 
                                        alt="Telegram QR Code" 
                                        className="w-36 h-36 object-contain"
                                    />
                                </div>
                                
                                <div className="text-center mb-5">
                                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider font-semibold mb-2">Scan or Search</p>
                                    <a 
                                        href="https://t.me/@smart_khata_bot" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xl font-bold text-[#0088cc] hover:text-[#006699] transition-colors"
                                    >
                                        @smart_khata_bot
                                    </a>
                                </div>

                                <button
                                    onClick={() => window.open('https://t.me/@smart_khata_bot', '_blank')}
                                    className="w-full max-w-[240px] bg-gradient-to-r from-[#0088cc] to-[#00a2e8] text-white py-3.5 rounded-xl font-semibold cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <Send size={18} />
                                    Open in Telegram
                                </button>

                                <div className="mt-5 flex items-center justify-center font-semibold gap-2 text-sm text-gray-500">
                                    <span className="w-2 h-2 bg-green-400 font-semibold rounded-full animate-pulse"></span>
                                    Press Start after opening
                                </div>
                            </div>

                            <div className="p-6 flex flex-col justify-center">
                                {!otpGenerated ? (
                                    <>
                                        <div className="mb-5">
                                            <h3 className="font-bold text-gray-800 text-lg mb-3">Enter Your Username</h3>
                                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-4">
                                                <p className="text-base text-gray-600 font-semibold mb-3">
                                                    For OTP & notifications:
                                                </p>
                                                <div className="space-y-3 text-sm text-gray-700">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                        <p className="text-sm text-gray-700 font-semibold">Scan QR or Search Bot</p>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                        <p className="text-sm text-gray-700 font-semibold">Press <span className="text-[#0088cc] font-bold">Start</span></p>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                        <p className="text-sm text-gray-700 font-semibold">Enter username below</p>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                                                        <p className="text-sm text-gray-700 font-semibold">Click Send OTP to receive code</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={inputUsername}
                                                    onChange={handleUsernameChange}
                                                    placeholder="@your_username"
                                                    className={`w-full font-semibold px-4 py-3.5 rounded-xl border-2 ${usernameError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-[#0088cc] focus:bg-white outline-none transition-all`}
                                                />
                                                {usernameError && <p className="text-red-500 text-xs mt-1.5 ml-1">{usernameError}</p>}
                                            </div>

                                            <button
                                                onClick={handleGenerateOTP}
                                                disabled={!inputUsername.trim() || generatingOTP || usernameError}
                                                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                            >
                                                {generatingOTP ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>Send OTP<span className="text-white/60">→</span></>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                ) : !otpVerified ? (
                                    <>
                                        <div className="text-center mb-5">
                                            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-200">
                                                <CheckCircle2 className="text-white" size={28} />
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-lg">OTP Sent!</h3>
                                            <p className="text-sm text-gray-500 font-semibold">Check your Telegram chat</p>
                                        </div>

                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                value={otpInput}
                                                onChange={(e) => { setOtpInput(e.target.value); setOtpError(""); }}
                                                placeholder="• • • • • •"
                                                maxLength={6}
                                                className="w-full text-center text-2xl tracking-[0.4em] font-mono py-4 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-[#0088cc] focus:bg-white outline-none transition-all text-gray-800"
                                            />
                                            {otpError && <p className="text-red-500 text-xs text-center">{otpError}</p>}
                                            
                                            <button
                                                onClick={handleVerifyOTP}
                                                disabled={!otpInput.trim() || verifyingOTP}
                                                className="w-full bg-gradient-to-r from-[#0088cc] to-[#00a2e8] text-white py-3.5 rounded-xl font-semibold cursor-pointer hover:shadow-lg disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                                            >
                                                {verifyingOTP ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={18} />
                                                        Verify & Link
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={handleGenerateOTP}
                                                disabled={generatingOTP}
                                                className="w-full text-[#0088cc] text-sm font-semibold hover:underline cursor-pointer disabled:opacity-50 py-2"
                                            >
                                                Resend OTP
                                            </button>
                                        </div>
                                    </>
                                ) : linkVerified ? (
                                    <>
                                        <div className="text-center mb-5">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200 animate-bounce">
                                                <CheckCircle2 className="text-white" size={32} />
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-2xl mb-2">Successfully Linked! ✓</h3>
                                            <p className="text-sm text-gray-600 font-semibold">Your Telegram account is now connected</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 mb-5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CheckCircle2 className="text-green-600" size={20} />
                                                <p className="font-bold text-green-900">Telegram account connected!</p>
                                            </div>
                                            <p className="text-sm text-green-700 font-semibold">You'll now receive instant notifications for all expenses</p>
                                        </div>

                                        <button
                                            onClick={resetModal}
                                            className="w-full bg-gradient-to-r from-[#0088cc] to-[#00a2e8] text-white py-3.5 rounded-xl font-semibold cursor-pointer hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={18} />
                                            Done
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center mb-5">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200 relative">
                                                <MessageSquare className="text-white" size={28} />
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-lg mb-1">OTP Sent to Telegram!</h3>
                                            <p className="text-sm text-gray-500 font-semibold">Check your bot chat</p>
                                        </div>

                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-5">
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                    <p className="text-sm text-gray-700 font-semibold">Open <span className="font-bold text-[#0088cc]">@smart_khata_bot</span> on Telegram</p>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                    <p className="text-sm text-gray-700 font-semibold">Use the same OTP received on Telegram</p>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                    <p className="text-sm text-gray-700 font-semibold">Paste the OTP again to continue</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            <span className="font-semibold">Waiting for verification...</span>
                                        </div>

                                        <button
                                            onClick={openTelegramBot}
                                            className="w-full bg-gradient-to-r from-[#0088cc] to-[#00a2e8] text-white py-3.5 rounded-xl font-semibold cursor-pointer hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <Send size={18} />
                                            Open Telegram Bot
                                        </button>

                                        <button
                                            onClick={handleGenerateOTP}
                                            disabled={generatingOTP}
                                            className="w-full text-[#0088cc] text-sm font-semibold hover:underline cursor-pointer disabled:opacity-50 py-2 mt-3"
                                        >
                                            Resend OTP
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-400">Your data stays private & secure</p>
                            <button
                                onClick={resetModal}
                                className="text-gray-500 font-semibold hover:text-gray-700 text-sm font-medium cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;