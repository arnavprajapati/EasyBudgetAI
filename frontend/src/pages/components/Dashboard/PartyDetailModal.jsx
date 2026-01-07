import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import api from '../../../apiIntercepter';
import { toast } from 'react-toastify';

const PartyDetailModal = ({ party, onClose }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalGiven: 0,
        totalReceived: 0,
        toReceive: 0,
        toGive: 0,
        balance: 0
    });
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });

    useEffect(() => {
        fetchPartyTransactions(1);
    }, [party.name]);

    const fetchPartyTransactions = async (page) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/api/v1/expense/parties/${encodeURIComponent(party.name)}`);
            setTransactions(data.transactions || []);
            setSummary(data.summary || { toReceive: 0, toGive: 0, netBalance: 0 });
            setPagination({ page: 1, pages: 1, total: data.summary?.transactionCount || 0 });
        } catch (error) {
            toast.error('Failed to load transactions');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getBalanceColor = (balance) => {
        if (balance > 0) return 'text-green-600 bg-green-50';
        if (balance < 0) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    const getBalanceText = (balance) => {
        if (balance > 0) return `${party.name} owes you`;
        if (balance < 0) return `You owe ${party.name}`;
        return 'Settled up';
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {party.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{party.name}</h2>
                                <p className="text-sm text-gray-500">{pagination.total} transaction{pagination.total !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <X size={22} className="text-gray-500" />
                        </button>
                    </div>

                    <div className={`rounded-xl p-4 ${getBalanceColor(summary.netBalance)}`}>
                        <p className="text-sm font-bold opacity-80">{getBalanceText(summary.netBalance)}</p>
                        <p className="text-3xl font-bold mt-1">
                            {formatCurrency(Math.abs(summary.netBalance || 0))}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={18} className="text-green-600" />
                                <span className="text-sm font-bold text-green-700">To Receive</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.toReceive || 0)}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingDown size={18} className="text-red-600" />
                                <span className="text-sm font-bold text-red-700">To Give</span>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.toGive || 0)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Transaction History</h3>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No transactions found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((txn, index) => {
                                const isPendingToReceive = txn.description?.toLowerCase().includes('to receive');


                                const isPositive = txn.type === 'credit' || isPendingToReceive;

                                return (
                                    <div
                                        key={txn._id || index}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                                                {isPositive ? (
                                                    <TrendingUp size={18} className="text-green-600" />
                                                ) : (
                                                    <TrendingDown size={18} className="text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{txn.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                                    <Calendar size={12} />
                                                    <span className='text-xs font-bold'>{formatDate(txn.date)} • {formatTime(txn.date)}</span>
                                                    {txn.source === 'telegram' && (
                                                        <>
                                                            <span>•</span>
                                                            <MessageSquare size={12} />
                                                            <span className='text-xs font-bold'>Telegram</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            {isPositive ? '+' : '-'}{formatCurrency(txn.amount)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                onClick={() => fetchPartyTransactions(pagination.page - 1)}
                                disabled={pagination.page === 1 || loading}
                                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                                <ChevronLeft size={20} className="text-gray-600" />
                            </button>
                            <span className="text-sm font-bold text-gray-600">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => fetchPartyTransactions(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages || loading}
                                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                                <ChevronRight size={20} className="text-gray-600" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs font-bold text-gray-400 text-center">
                        💡 Tip: You can quickly add transactions through Telegram by sending messages like
                        “Paid 500 to {party.name}” or “Received 1000 from {party.name}.”"
                    </p>
                </div>
            </div>
        </div >
    );
};

export default PartyDetailModal;
