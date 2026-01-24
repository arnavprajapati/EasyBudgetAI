import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight, MessageSquare, Trash2, Pencil } from 'lucide-react';
import api from '../../../apiIntercepter';
import { toast } from 'react-toastify';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditTransactionModal from './EditTransactionModal';

const PartyDetailModal = ({ party, onClose }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        toReceive: 0,
        toGive: 0,
        netBalance: 0
    });
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, transaction: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [editModal, setEditModal] = useState({ isOpen: false, transaction: null });

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
            // toast.error('Failed to load transactions');
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

    const handleDeleteClick = (txn) => {
        setDeleteModal({ isOpen: true, transaction: txn });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.transaction) return;
        
        setIsDeleting(true);
        try {
            await api.delete(`/api/v1/expense/${deleteModal.transaction._id}`);
            // toast.success('Transaction deleted successfully');
            setDeleteModal({ isOpen: false, transaction: null });
            fetchPartyTransactions(pagination.page);
        } catch (error) {
            console.error('Failed to delete:', error);
            // toast.error('Failed to delete transaction');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed bg-opacity-70 backdrop-blur-md inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {party.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{party.name}</h2>
                            <p className="text-xs font-bold text-gray-500">{pagination.total} transaction{pagination.total !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="w-2/5 bg-gradient-to-b from-gray-50 to-white p-5 border-r border-gray-100 flex flex-col">
                        <div className={`rounded-xl p-4 mb-4 ${getBalanceColor(summary.netBalance)}`}>
                            <p className="text-xs font-bold opacity-80">{getBalanceText(summary.netBalance)}</p>
                            <p className="text-2xl font-bold mt-1">
                                {formatCurrency(Math.abs(summary.netBalance || 0))}
                            </p>
                        </div>

                        <div className="space-y-3 flex-1">
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <TrendingUp size={16} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-green-700">To Receive</p>
                                            <p className="text-xs font-semibold text-green-600">They owe you</p>
                                        </div>
                                    </div>
                                    <p className="text-xl font-bold text-green-600">{formatCurrency(summary.toReceive || 0)}</p>
                                </div>
                            </div>

                            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <TrendingDown size={16} className="text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-red-700">To Give</p>
                                            <p className="text-xs font-semibold text-red-600">You owe them</p>
                                        </div>
                                    </div>
                                    <p className="text-xl font-bold text-red-600">{formatCurrency(summary.toGive || 0)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-xs font-semibold font-bold text-purple-600 text-center">
                                💡 Quick add via Telegram: "Paid 500 to {party.name}"
                            </p>
                        </div>
                    </div>

                    <div className="w-3/5 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Transaction History</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 max-h-[60vh]">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 font-semibold">No transactions found</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {transactions.map((txn, index) => {
                                        const isCredit = txn.type === 'credit';

                                        return (
                                            <div
                                                key={txn._id || index}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                                                        {isCredit ? (
                                                            <TrendingUp size={16} className="text-green-600" />
                                                        ) : (
                                                            <TrendingDown size={16} className="text-red-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-base">{txn.description}</p>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                                                            <Calendar size={12} />
                                                            <span className="font-bold text-xs">{formatDate(txn.date)} • {formatTime(txn.date)}</span>
                                                            {txn.source === 'telegram' && (
                                                                <>
                                                                    <span>•</span>
                                                                    <MessageSquare size={12} />
                                                                    <span className="font-bold text-xs">Telegram</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-bold text-base ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                                        {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditModal({ isOpen: true, transaction: txn });
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                                        title="Edit transaction"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(txn);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                                        title="Delete transaction"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-2 p-3 border-t border-gray-100 bg-white">
                                <button
                                    onClick={() => fetchPartyTransactions(pagination.page - 1)}
                                    disabled={pagination.page === 1 || loading}
                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                    <ChevronLeft size={18} className="text-gray-600" />
                                </button>
                                <span className="text-xs font-bold text-gray-600">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => fetchPartyTransactions(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages || loading}
                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                    <ChevronRight size={18} className="text-gray-600" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, transaction: null })}
                onConfirm={handleDeleteConfirm}
                transactionDescription={deleteModal.transaction?.description || 'Transaction'}
                amount={deleteModal.transaction?.amount}
                isDeleting={isDeleting}
            />
            
            <EditTransactionModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, transaction: null })}
                onSuccess={() => fetchPartyTransactions(pagination.page)}
                transaction={editModal.transaction}
            />
        </div>
    );
};

export default PartyDetailModal;
