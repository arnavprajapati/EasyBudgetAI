import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTelegramStatus } from "../redux/slices/telegramSlice";
import api from "../apiIntercepter";
import { toast } from "react-toastify";
import { Trash2, Pencil, Search, ChevronDown, RefreshCw } from "lucide-react";
import analytics from "../utils/analytics";

import TelegramOnboarding from "./components/TelegramOnboarding";
import DailyTrendChart from "./components/Dashboard/DailyTrendChart";
import TimeFilter from "./components/Dashboard/TimeFilter";
import AddTransactionModal from "./components/Dashboard/AddTransactionModal";
import DeleteConfirmModal from "./components/Dashboard/DeleteConfirmModal";
import EditTransactionModal from "./components/Dashboard/EditTransactionModal";

const Home = () => {
    const { user } = useSelector((state) => state.auth);
    const { linked, loading: telegramLoading } = useSelector((state) => state.telegram);
    const dispatch = useDispatch();

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState('week');
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, expense: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [editModal, setEditModal] = useState({ isOpen: false, expense: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        totalBalance: 0,
        transactionCount: 0
    });

    useEffect(() => {
        dispatch(fetchTelegramStatus());
        analytics.pageView('Home', { hasExpenses: expenses.length > 0 });
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
        setCurrentPage(1); 
    }, [expenses, period]);

    const fetchExpenses = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await api.get('/api/v1/expense/all?limit=1000');
            setExpenses(response.data.expenses || []);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                // toast.error('Failed to load expenses');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
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

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(exp => 
                (exp.description?.toLowerCase().includes(query)) ||
                (exp.category?.toLowerCase().includes(query)) ||
                (exp.partyName?.toLowerCase().includes(query))
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(exp => exp.category === selectedCategory);
        }

        return filtered;
    };

    // Get unique categories from expenses
    const uniqueCategories = [...new Set(expenses.map(exp => exp.category).filter(Boolean))].sort();

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

    const handleDeleteClick = (expense) => {
        setDeleteModal({ isOpen: true, expense });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.expense) return;
        
        setIsDeleting(true);
        try {
            await api.delete(`/api/v1/expense/${deleteModal.expense._id}`);
            analytics.deleteTransaction(deleteModal.expense.type, deleteModal.expense.amount);
            // toast.success('Transaction deleted successfully');
            setDeleteModal({ isOpen: false, expense: null });
            fetchExpenses();
        } catch (error) {
            console.error('Failed to delete:', error);
            // toast.error('Failed to delete transaction');
        } finally {
            setIsDeleting(false);
        }
    };

    const categoryColors = {
        'Food & Dining': 'bg-orange-500',
        'Food': 'bg-orange-500',
        'Dining': 'bg-orange-600',
        'Travel & Transport': 'bg-blue-500',
        'Travel': 'bg-blue-500',
        'Transport': 'bg-cyan-500',
        'Transportation': 'bg-cyan-500',
        'Shopping & Entertainment': 'bg-pink-500',
        'Shopping': 'bg-pink-500',
        'Entertainment': 'bg-fuchsia-500',
        'Housing / Rent': 'bg-purple-500',
        'Housing': 'bg-purple-500',
        'Rent': 'bg-violet-500',
        'Bills & Utilities': 'bg-amber-500',
        'Bills': 'bg-amber-500',
        'Utilities': 'bg-yellow-600',
        'Personal & Transfers': 'bg-indigo-500',
        'Personal': 'bg-indigo-500',
        'Transfers': 'bg-blue-600',
        'Miscellaneous': 'bg-rose-500',
        'Other': 'bg-slate-500',
        'Healthcare': 'bg-emerald-500',
        'Health': 'bg-emerald-500',
        'Medical': 'bg-green-600',
        'Education': 'bg-blue-600',
        'Groceries': 'bg-lime-500',
        'Grocery': 'bg-lime-500',
        'Fuel': 'bg-yellow-500',
        'Petrol': 'bg-yellow-500',
        'Investment': 'bg-violet-600',
        'Investments': 'bg-violet-600',
        
        // Income
        'Salary & Income': 'bg-green-500',
        'Salary': 'bg-green-500',
        'Income': 'bg-emerald-600',
        'Refunds & Returns': 'bg-teal-500',
        'Refund': 'bg-teal-500',
        'Refunds': 'bg-teal-500',
        'Returns': 'bg-teal-600',
        'Received from Others': 'bg-sky-500',
        'Received': 'bg-sky-500',
        'Bonus': 'bg-yellow-400',
        'Freelance': 'bg-green-400',
        'Interest': 'bg-cyan-400',
        'Dividend': 'bg-purple-400',
        'Gift': 'bg-pink-400'
    };


    const filteredExpenses = getFilteredExpenses();

    if (telegramLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-semibold text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!linked) {
        return <TelegramOnboarding userName={userName} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Hi, <span className="text-[#387ED1]">{userName}</span>! Here’s your quick summary
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <TimeFilter selectedPeriod={period} onPeriodChange={setPeriod} maxPeriod="3months" />
                        <a
                            href="/party"
                            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-3 md:px-4 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                            <span className="hidden sm:inline">Khata Book</span>
                            <span className="sm:hidden">Khata</span>
                        </a>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-3 md:px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span className="hidden sm:inline">Add Transaction</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">Transaction Overview</h2>
                        <button
                            onClick={() => fetchExpenses(true)}
                            disabled={refreshing}
                            className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Refresh data"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 border-b border-gray-100">
                        <div className="p-5 text-center border-r border-gray-100">
                            <p className="text-base text-gray-500 font-semibold mb-1">Total Income</p>
                            <p className="text-xl md:text-2xl font-bold text-green-500">
                                ₹{summary.totalIncome.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="p-5 text-center border-r border-gray-100">
                            <p className="text-base text-gray-500 font-semibold mb-1">Total Expenses</p>
                            <p className="text-xl md:text-2xl font-bold text-red-500">
                                ₹{summary.totalExpense.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="p-5 text-center">
                            <p className="text-base text-gray-500 font-semibold mb-1">Net</p>
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
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h2 className="text-lg font-bold text-gray-800">
                                Recent Transactions 
                                <span className="text-gray-400 font-semibold text-sm ml-2">
                                    ({period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last Month' : 'Last 3 Months'})
                                </span>
                            </h2>
                            <a href="/dashboard" className="hidden md:block text-sm text-[#387ED1] font-semibold hover:underline">
                                View All →
                            </a>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by description, category or party..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            
                            <div className="relative">
                                <button
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    className="flex items-center justify-between gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:border-gray-400 focus:outline-none focus:border-blue-500 transition-all min-w-[160px] cursor-pointer bg-white"
                                >
                                    <span>{selectedCategory === 'all' ? 'All Categories' : selectedCategory}</span>
                                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showCategoryDropdown && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setShowCategoryDropdown(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-72 overflow-y-auto py-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedCategory('all');
                                                    setShowCategoryDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <span>All Categories</span>
                                                {selectedCategory === 'all' && (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                            {uniqueCategories.map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => {
                                                        setSelectedCategory(category);
                                                        setShowCategoryDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between ${selectedCategory === category ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <span>{category}</span>
                                                    {selectedCategory === category && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <a href="/dashboard" className="md:hidden text-sm text-[#387ED1] font-semibold hover:underline text-center">
                                View All →
                            </a>
                        </div>
                        
                        {(searchQuery || selectedCategory !== 'all') && (
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <span className="text-xs text-gray-500 font-semibold">Filters:</span>
                                {searchQuery && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                                        Search: "{searchQuery}"
                                        <button onClick={() => setSearchQuery('')} className="hover:text-blue-900 cursor-pointer">✕</button>
                                    </span>
                                )}
                                {selectedCategory !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                                        {selectedCategory}
                                        <button onClick={() => setSelectedCategory('all')} className="hover:text-purple-900 cursor-pointer">✕</button>
                                    </span>
                                )}
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('all');
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer font-semibold"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {filteredExpenses.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <p className="font-semibold text-lg">No transactions yet</p>
                            <p className="text-sm font-semibold mt-1">Start tracking via Telegram!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-8 py-5 text-sm font-bold text-gray-500 uppercase tracking-wider w-1/5">Date</th>
                                        <th className="text-left px-8 py-5 text-sm font-bold text-gray-500 uppercase tracking-wider w-1/4">Description</th>
                                        <th className="text-center px-8 py-5 text-sm font-bold text-gray-500 uppercase tracking-wider w-1/6">Category</th>
                                        <th className="text-right px-8 py-5 text-sm font-bold text-gray-500 uppercase tracking-wider w-1/6">Amount</th>
                                        <th className="text-center px-4 py-5 text-sm font-bold text-gray-500 uppercase tracking-wider w-16">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((expense, index) => (
                                        <tr key={expense._id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-6 text-base text-gray-600 font-semibold whitespace-nowrap">
                                                {new Date(expense.date).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-base font-semibold text-gray-800">
                                                    {expense.description || expense.category}
                                                </p>
                                                {expense.partyName && (
                                                    <p className="text-xs font-semibold text-gray-400 mt-1">{expense.partyName}</p>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`inline-block px-4 py-1.5 text-sm font-bold text-white rounded-lg shadow-sm ${categoryColors[expense.category] || 'bg-gray-500'}`}>
                                                    {expense.category?.split(' ')[0] || 'Other'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`text-lg font-bold ${expense.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {expense.type === 'credit' ? '+' : '-'}₹{expense.amount.toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-6 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => setEditModal({ isOpen: true, expense })}
                                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                                        title="Edit transaction"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(expense)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                                        title="Delete transaction"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {filteredExpenses.length > itemsPerPage && (
                                <div className="mt-4 border-t border-gray-100 pt-8 pb-14">
                                    <div className="text-xs text-center font-bold text-gray-400 mb-3">
                                        Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length}
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${currentPage === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 cursor-pointer'}`}
                                        >
                                            ← Prev
                                        </button>
                                        {Array.from({ length: Math.ceil(filteredExpenses.length / itemsPerPage) }, (_, i) => i + 1)
                                            .filter(page => page === 1 || page === Math.ceil(filteredExpenses.length / itemsPerPage) || Math.abs(page - currentPage) <= 1)
                                            .map((page, idx, arr) => (
                                                <React.Fragment key={page}>
                                                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="text-gray-400">...</span>}
                                                    <button
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 cursor-pointer'}`}
                                                    >
                                                        {page}
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredExpenses.length / itemsPerPage), p + 1))}
                                            disabled={currentPage === Math.ceil(filteredExpenses.length / itemsPerPage)}
                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${currentPage === Math.ceil(filteredExpenses.length / itemsPerPage) ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 cursor-pointer'}`}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <AddTransactionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchExpenses}
            />
            
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, expense: null })}
                onConfirm={handleDeleteConfirm}
                transactionDescription={deleteModal.expense?.description || deleteModal.expense?.category}
                amount={deleteModal.expense?.amount}
                isDeleting={isDeleting}
            />
            
            <EditTransactionModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, expense: null })}
                onSuccess={fetchExpenses}
                transaction={editModal.expense}
            />
        </div>
    );
};

export default Home;