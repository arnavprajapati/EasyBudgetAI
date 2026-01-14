import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTelegramStatus } from "../redux/slices/telegramSlice";
import api from "../apiIntercepter";
import { toast } from "react-toastify";

// Import Components
import TelegramOnboarding from "./components/TelegramOnboarding";
import DailyTrendChart from "./components/Dashboard/DailyTrendChart";
import TimeFilter from "./components/Dashboard/TimeFilter";

const Home = () => {
    const { user } = useSelector((state) => state.auth);
    const { linked, loading: telegramLoading } = useSelector((state) => state.telegram);
    const dispatch = useDispatch();

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        totalBalance: 0,
        transactionCount: 0
    });

    useEffect(() => {
        dispatch(fetchTelegramStatus());
    }, [dispatch]);

    useEffect(() => {
        if (linked) {
            fetchExpenses();
        } else {
            setLoading(false);
        }
    }, [linked]);

    useEffect(() => {
        if (expenses.length > 0) {
            calculateSummary();
        }
    }, [expenses, period]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/v1/expense/all?limit=1000');
            setExpenses(response.data.expenses || []);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                toast.error('Failed to load expenses');
            }
        } finally {
            setLoading(false);
        }
    };

    const getFilteredExpenses = () => {
        const now = new Date();
        let filtered = expenses;

        switch (period) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = expenses.filter(exp => new Date(exp.date) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filtered = expenses.filter(exp => new Date(exp.date) >= monthAgo);
                break;
            case '3months':
                const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                filtered = expenses.filter(exp => new Date(exp.date) >= threeMonthsAgo);
                break;
            case '6months':
                const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                filtered = expenses.filter(exp => new Date(exp.date) >= sixMonthsAgo);
                break;
            default:
                filtered = expenses;
        }
        return filtered;
    };

    const calculateSummary = () => {
        const filtered = getFilteredExpenses();
        let totalIncome = 0;
        let totalExpense = 0;

        filtered.forEach(exp => {
            if (exp.type === 'credit') {
                totalIncome += exp.amount;
            } else {
                totalExpense += exp.amount;
            }
        });

        let allIncome = 0;
        let allExpense = 0;
        expenses.forEach(exp => {
            if (exp.type === 'credit') {
                allIncome += exp.amount;
            } else {
                allExpense += exp.amount;
            }
        });

        setSummary({
            totalIncome,
            totalExpense,
            totalBalance: allIncome - allExpense,
            transactionCount: expenses.length
        });
    };

    const userName = user?.name?.split(' ')[0] || 'User';
    const net = summary.totalIncome - summary.totalExpense;

    // Category badge colors
    const categoryColors = {
        'Food & Dining': 'bg-orange-500',
        'Travel & Transport': 'bg-blue-500',
        'Shopping & Entertainment': 'bg-pink-500',
        'Housing / Rent': 'bg-purple-500',
        'Bills & Utilities': 'bg-yellow-500',
        'Personal & Transfers': 'bg-indigo-500',
        'Salary & Income': 'bg-green-500',
        'Refunds & Returns': 'bg-teal-500',
        'Other': 'bg-gray-500'
    };

    if (loading || telegramLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#387ED1] mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-bold">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!linked) {
        return <TelegramOnboarding userName={userName} />;
    }

    const filteredExpenses = getFilteredExpenses();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Welcome back, <span className="text-[#387ED1]">{userName}</span>! 👋
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">
                            Here's your financial overview
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={`text-2xl md:text-3xl font-bold ${summary.totalBalance >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                            ₹{summary.totalBalance.toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-gray-400">{summary.transactionCount} Transactions</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">Transaction Overview</h2>
                        <TimeFilter selectedPeriod={period} onPeriodChange={setPeriod} />
                    </div>

                    <div className="grid grid-cols-3 border-b border-gray-100">
                        <div className="p-5 text-center border-r border-gray-100">
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Income</p>
                            <p className="text-xl md:text-2xl font-bold text-green-500">
                                ₹{summary.totalIncome.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="p-5 text-center border-r border-gray-100">
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Expenses</p>
                            <p className="text-xl md:text-2xl font-bold text-red-500">
                                ₹{summary.totalExpense.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="p-5 text-center">
                            <p className="text-sm text-gray-500 font-medium mb-1">Net</p>
                            <p className={`text-xl md:text-2xl font-bold ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ₹{net.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    <div className="p-5">
                        <DailyTrendChart expenses={filteredExpenses} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
                        <a href="/dashboard" className="text-sm text-[#387ED1] font-semibold hover:underline">
                            View All →
                        </a>
                    </div>

                    {filteredExpenses.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <p className="font-medium text-lg">No transactions yet</p>
                            <p className="text-sm mt-1">Start tracking via Telegram!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredExpenses.slice(0, 15).map((expense, index) => (
                                        <tr key={expense._id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 text-sm text-gray-600 font-medium whitespace-nowrap">
                                                {new Date(expense.date).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {expense.description || expense.category}
                                                </p>
                                                {expense.partyName && (
                                                    <p className="text-xs text-gray-400 mt-0.5">{expense.partyName}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-md ${categoryColors[expense.category] || 'bg-gray-500'}`}>
                                                    {expense.category?.split(' ')[0] || 'Other'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className={`font-bold ${expense.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {expense.type === 'credit' ? '+' : '-'}₹{expense.amount.toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;