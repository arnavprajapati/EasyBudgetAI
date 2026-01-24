import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchTelegramStatus } from "../redux/slices/telegramSlice";
import { logoutUser } from "../redux/slices/authSlice";
import api from "../apiIntercepter";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    Shield,
    Send,
    Settings,
    LogOut,
    Key,
    Lock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    TrendingDown,
    Wallet,
    Eye,
    EyeOff,
    X
} from "lucide-react";

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { linked, telegramUsername, telegramLinkedAt } = useSelector((state) => state.telegram);

    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        transactionCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        dispatch(fetchTelegramStatus());
        fetchStats();
    }, [dispatch]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/v1/expense/all?limit=1000');
            const expenses = response.data.expenses || [];

            let totalIncome = 0;
            let totalExpense = 0;

            expenses.forEach(exp => {
                if (exp.type === 'credit') {
                    totalIncome += exp.amount;
                } else {
                    totalExpense += exp.amount;
                }
            });

            setStats({
                totalIncome,
                totalExpense,
                transactionCount: expenses.length
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logoutUser(navigate));
    };

    const handleChangePassword = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            // toast.error("Please fill all fields");
            return;
        }

        if (newPassword.length < 6) {
            // toast.error("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            // toast.error("Passwords do not match");
            return;
        }

        setChangingPassword(true);
        try {
            await api.post('/api/v1/change-password', {
                currentPassword,
                newPassword
            });
            // toast.success("Password changed successfully!");
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            // toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setChangingPassword(false);
        }
    };

    const handleForgotPassword = async () => {
        try {
            await api.post('/api/v1/forgot-password', { email: user?.email });
            // toast.success("Password reset link sent to your email!");
        } catch (error) {
            // toast.error(error.response?.data?.message || "Failed to send reset link");
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const userName = user?.name || 'User';
    const userEmail = user?.email || 'user@example.com';
    const memberSince = user?.createdAt ? formatDate(user.createdAt) : 'Recently joined';


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>
                        <p className="text-gray-500 text-sm font-semibold">Manage your account & preferences</p>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-semibold transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={20} /> Back
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-[#387ED1] to-[#5B9AE8] p-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl font-semibold text-[#387ED1]">{getInitials(userName)}</span>
                            </div>
                            <div className="text-white">
                                <h2 className="text-2xl font-semibold">{userName}</h2>
                                <div className="flex items-center gap-2 mt-1 opacity-90">
                                    <Mail size={16} />
                                    <span className="text-basem tracking-wider font-semibold">{userEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                        {user?.role || 'User'}
                                    </span>
                                    {linked && (
                                        <span className="bg-green-400/30 tracking-wider backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold flex tracking-wider items-center gap-1">
                                            <CheckCircle2 size={12} /> Telegram Linked
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                        <div className="p-5 text-center">
                            <div className="flex items-center justify-center mb-2">
                                <Calendar size={18} className="text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Member Since</p>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{memberSince}</p>
                        </div>
                        <div className="p-5 text-center">
                            <div className="flex items-center justify-center mb-2">
                                <Wallet size={18} className="text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Transactions</p>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{stats.transactionCount}</p>
                        </div>
                        <div className="p-5 text-center">
                            <div className="flex items-center justify-center mb-2">
                                <TrendingUp size={18} className="text-green-500" />
                            </div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Income</p>
                            <p className="text-sm font-semibold text-green-500 mt-1">₹{stats.totalIncome.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-5 text-center">
                            <div className="flex items-center justify-center mb-2">
                                <TrendingDown size={18} className="text-red-500" />
                            </div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Expense</p>
                            <p className="text-sm font-semibold text-red-500 mt-1">₹{stats.totalExpense.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <User size={20} className="text-[#387ED1]" />
                            Account Information
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-6 space-y-4 border-r border-gray-100">
                            <div className="flex items-center justify-between py-3 border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg">
                                        <User size={18} className="text-[#387ED1]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Full Name</p>
                                        <p className="text-sm font-semibold text-gray-800">{userName}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg">
                                        <Mail size={18} className="text-[#387ED1]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Email Address</p>
                                        <p className="text-sm font-semibold text-gray-800">{userEmail}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg">
                                        <Send size={18} className="text-[#387ED1]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Telegram Status</p>
                                        {linked ? (
                                            <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                                <CheckCircle2 size={14} /> @{telegramUsername}
                                            </p>
                                        ) : (
                                            <p className="text-sm font-semibold text-gray-400 flex items-center gap-1">
                                                <XCircle size={14} /> Not Connected
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {!linked && (
                                    <button
                                        onClick={() => navigate('/settings')}
                                        className="text-sm font-semibold text-[#387ED1] hover:underline cursor-pointer"
                                    >
                                        Link Now
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-blue-50/50 to-gray-50">
                            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Account Summary</h4>
                            
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                                <p className="text-xs text-gray-500 font-semibold uppercase">Net Balance</p>
                                <p className={`text-2xl font-semibold mt-1 ${(stats.totalIncome - stats.totalExpense) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ₹{(stats.totalIncome - stats.totalExpense).toLocaleString('en-IN')}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                    {(stats.totalIncome - stats.totalExpense) >= 0 ? (
                                        <TrendingUp size={14} className="text-green-500" />
                                    ) : (
                                        <TrendingDown size={14} className="text-red-500" />
                                    )}
                                    <span className="text-xs text-gray-500 font-semibold">
                                        {(stats.totalIncome - stats.totalExpense) >= 0 ? 'In profit' : 'In loss'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Quick Tip</p>
                                <p className="text-sm text-gray-600 font-semibold leading-relaxed">
                                    {!linked 
                                        ? "💡 Link your Telegram to track expenses instantly via chat!"
                                        : stats.transactionCount === 0 
                                            ? "💡 Start adding transactions to see your financial insights!"
                                            : "💡 Keep tracking daily to build better financial habits!"
                                    }
                                </p>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-500 font-semibold">Account Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Shield size={20} className="text-[#387ED1]" />
                            Security & Actions
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                        >
                            <div className="bg-white p-3 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                <Key size={20} className="text-[#387ED1]" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800">Change Password</p>
                                <p className="text-xs text-gray-500 font-semibold">Update your password</p>
                            </div>
                        </button>

                        <button
                            onClick={handleForgotPassword}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                        >
                            <div className="bg-white p-3 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                <Lock size={20} className="text-orange-500" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800">Reset Password</p>
                                <p className="text-xs text-gray-500 font-semibold">Get reset link via email</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/settings')}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                        >
                            <div className="bg-white p-3 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                <Settings size={20} className="text-gray-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800">Settings</p>
                                <p className="text-xs text-gray-500 font-semibold">Telegram & preferences</p>
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer group"
                        >
                            <div className="bg-white p-3 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                <LogOut size={20} className="text-red-500" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-red-600">Logout</p>
                                <p className="text-xs text-red-400 font-semibold">Sign out of account</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="text-center py-4">
                    <p className="text-sm text-gray-400 tracking-wider font-semibold">
                        SmartKhata • Your Personal Finance Manager
                    </p>
                </div>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                        <button
                            onClick={() => {
                                setShowPasswordModal(false);
                                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                            }}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                <Key className="text-[#387ED1]" size={32} />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
                            <p className="text-sm text-gray-500 font-semibold">Enter your current and new password</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="Current Password"
                                    className="w-full font-semibold px-4 py-4 pr-12 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-[#387ED1] focus:bg-white outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="New Password"
                                    className="w-full font-semibold px-4 py-4 pr-12 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-[#387ED1] focus:bg-white outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm New Password"
                                    className="w-full font-semibold px-4 py-4 pr-12 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-[#387ED1] focus:bg-white outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="w-full bg-[#387ED1] cursor-pointer py-4 rounded-xl text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
                            >
                                {changingPassword ? "Changing..." : "Change Password"}
                            </button>

                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    handleForgotPassword();
                                }}
                                className="w-full text-center text-sm text-gray-500 hover:text-[#387ED1] font-semibold cursor-pointer py-2"
                            >
                                Forgot current password? Reset via email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;