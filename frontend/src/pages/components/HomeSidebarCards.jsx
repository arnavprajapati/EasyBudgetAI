import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send,
    CheckCircle2,
    Wallet,
    TrendingUp,
    TrendingDown,
    LayoutDashboard,
    BookOpen,
    ArrowRight
} from 'lucide-react';

export const BalanceCard = ({ totalBalance, transactionCount }) => {
    return (
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
                <Wallet size={20} />
                <span className="text-sm font-bold text-gray-300">Total Balance</span>
            </div>
            <p className="text-3xl font-bold mb-2">
                ₹{totalBalance.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-gray-400">
                {transactionCount} transactions
            </p>
        </div>
    );
};

export const TelegramStatusCard = ({ telegramUsername }) => {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <Send size={18} className="text-blue-600" />
                    </div>
                    <span className="font-bold text-gray-800">Telegram</span>
                </div>
                <CheckCircle2 size={20} className="text-green-500" />
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-green-600">Connected</span>
            </div>
            {telegramUsername && (
                <p className="text-sm text-gray-400 mt-1">@{telegramUsername}</p>
            )}
        </div>
    );
};

export const SummaryStatsCard = ({ totalIncome, totalExpense }) => {
    const net = totalIncome - totalExpense;

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-green-500" />
                    <span className="text-sm font-bold text-gray-500">Total Income</span>
                </div>
                <p className="text-2xl font-bold text-green-500">
                    ₹{totalIncome.toLocaleString('en-IN')}
                </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={18} className="text-red-500" />
                    <span className="text-sm font-bold text-gray-500">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold text-red-500">
                    ₹{totalExpense.toLocaleString('en-IN')}
                </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Wallet size={18} className="text-blue-500" />
                    <span className="text-sm font-bold text-gray-500">Net</span>
                </div>
                <p className={`text-2xl font-bold ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ₹{net.toLocaleString('en-IN')}
                </p>
            </div>
        </div>
    );
};

export const QuickStatsCard = ({ filteredExpenses, totalIncome, totalExpense }) => {
    const debitCount = filteredExpenses.filter(e => e.type === 'debit').length;
    const avgExpense = debitCount > 0 ? Math.round(totalExpense / debitCount) : 0;
    const savingsRate = totalIncome > 0 ? Math.round((totalIncome - totalExpense) / totalIncome * 100) : 0;

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">This Period</h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Transactions</span>
                    <span className="font-bold text-gray-800">{filteredExpenses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Avg. Expense</span>
                    <span className="font-bold text-gray-800">
                        ₹{avgExpense.toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Savings Rate</span>
                    <span className={`font-bold ${savingsRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {savingsRate}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export const QuickLinksCard = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Quick Links</h3>
            <div className="space-y-2">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                    <LayoutDashboard size={18} className="text-blue-500" />
                    <span className="font-medium text-gray-700">Full Dashboard</span>
                    <ArrowRight size={16} className="text-gray-400 ml-auto" />
                </button>
                <button
                    onClick={() => navigate('/party')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                    <BookOpen size={18} className="text-purple-500" />
                    <span className="font-medium text-gray-700">Khata Book</span>
                    <ArrowRight size={16} className="text-gray-400 ml-auto" />
                </button>
                <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                    <Send size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700">Telegram Settings</span>
                    <ArrowRight size={16} className="text-gray-400 ml-auto" />
                </button>
            </div>
        </div>
    );
};

export const QuickActionCard = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gradient-to-r from-[#387ED1] to-[#5b9be5] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-blue-100">💡 Quick Actions</span>
                    </div>
                    <h2 className="text-xl font-bold mb-1">Track Your Expenses</h2>
                    <p className="text-blue-100 text-sm">
                        Add transactions via Telegram or manually
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/party')}
                        className="bg-white text-[#387ED1] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer"
                    >
                        <BookOpen size={18} />
                        Khata Book
                    </button>
                </div>
            </div>
        </div>
    );
};
