import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import api from '../../../apiIntercepter';
import { toast } from 'react-toastify';
import analytics from '../../../utils/analytics';

const AddTransactionModal = ({ isOpen, onClose, onSuccess }) => {
    const [newExpense, setNewExpense] = useState({
        amount: '',
        description: '',
        category: 'Miscellaneous',
        type: 'debit'
    });
    const [categoryOpen, setCategoryOpen] = useState(false);
    const dropdownRef = useRef(null);

    const debitCategories = [
        { value: 'Food & Dining', label: '🍽️ Food & Dining' },
        { value: 'Travel & Transport', label: '🚗 Travel & Transport' },
        { value: 'Shopping & Entertainment', label: '🛍️ Shopping & Entertainment' },
        { value: 'Housing / Rent', label: '🏠 Housing / Rent' },
        { value: 'Bills & Utilities', label: '📱 Bills & Utilities' },
        { value: 'Personal & Transfers', label: '💸 Personal & Transfers' },
        { value: 'Miscellaneous', label: '📦 Miscellaneous' }
    ];

    const creditCategories = [
        { value: 'Salary & Income', label: '💼 Salary & Income' },
        { value: 'Refunds & Returns', label: '↩️ Refunds & Returns' },
        { value: 'Received from Others', label: '🤝 Received from Others' }
    ];

    const categories = newExpense.type === 'debit' ? debitCategories : creditCategories;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (newExpense.type === 'debit') {
            setNewExpense(prev => ({ ...prev, category: 'Miscellaneous' }));
        } else {
            setNewExpense(prev => ({ ...prev, category: 'Salary & Income' }));
        }
    }, [newExpense.type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/v1/expense/add', newExpense);
            analytics.addTransaction(newExpense.type, parseFloat(newExpense.amount), newExpense.category);
            // toast.success('Transaction added successfully!');
            setNewExpense({ amount: '', description: '', category: 'Miscellaneous', type: 'debit' });
            onSuccess();
            onClose();
        } catch (error) {
            // toast.error(error.response?.data?.message || 'Failed to add transaction');
        }
    };

    const getCurrentCategoryLabel = () => {
        const cat = categories.find(c => c.value === newExpense.category);
        return cat ? cat.label : categories[0].label;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-70 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-7">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#212529]">Add New Transaction</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-all cursor-pointer font-bold"
                        >
                            <X size={22} className="text-[#828282]" />
                        </button>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
                        <p className="text-sm font-bold text-blue-700 text-center">
                            💡 Tip: Use our <span className="text-blue-900">Telegram Bot</span> to add transactions easily just by typing naturally!
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-[#828282] mb-2">Transaction Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNewExpense({ ...newExpense, type: 'credit' })}
                                    className={`py-3.5 rounded-lg font-bold transition-all text-sm cursor-pointer ${newExpense.type === 'credit'
                                            ? 'bg-[#00D563] text-white'
                                            : 'bg-[#F5F5F5] text-[#4F4F4F] hover:bg-[#EEEEEE]'
                                        }`}
                                >
                                    💰 Credit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewExpense({ ...newExpense, type: 'debit' })}
                                    className={`py-3.5 rounded-lg font-bold transition-all text-sm cursor-pointer ${newExpense.type === 'debit'
                                            ? 'bg-[#FF3B3B] text-white'
                                            : 'bg-[#F5F5F5] text-[#4F4F4F] hover:bg-[#EEEEEE]'
                                        }`}
                                >
                                    💸 Debit
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#828282] mb-2">Amount (₹)</label>
                            <input
                                type="number"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg font-bold text-[#212529] placeholder:text-[#BDBDBD] focus:border-[#4F9CF9] focus:outline-none bg-white"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#828282] mb-2">Description</label>
                            <input
                                type="text"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg font-bold text-[#212529] placeholder:text-[#BDBDBD] focus:border-[#4F9CF9] focus:outline-none bg-white"
                                placeholder="What did you spend on?"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#828282] mb-2">Category</label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setCategoryOpen(!categoryOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#E0E0E0] rounded-lg font-bold text-[#212529] hover:border-[#4F9CF9] transition-all bg-white cursor-pointer"
                                >
                                    <span>{getCurrentCategoryLabel()}</span>
                                    <ChevronDown 
                                        size={18} 
                                        className={`text-[#828282] transition-transform ${categoryOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {categoryOpen && (
                                    <div className="absolute left-0 right-0 bottom-full mb-2 bg-white border-2 border-[#E0E0E0] rounded-lg shadow-xl z-50 overflow-hidden">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => {
                                                    setNewExpense({ ...newExpense, category: cat.value });
                                                    setCategoryOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 font-bold text-sm transition-all cursor-pointer ${
                                                    newExpense.category === cat.value
                                                        ? 'bg-[#4F9CF9] text-white'
                                                        : 'text-[#212529] hover:bg-[#F5F5F5]'
                                                }`}
                                            >
                                                {cat.label}
                                                {newExpense.category === cat.value && (
                                                    <span className="float-right">✓</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-[#F5F5F5] text-[#4F4F4F] rounded-lg font-bold hover:bg-[#EEEEEE] transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-[#1E1E1E] text-white rounded-lg font-bold hover:bg-[#000000] transition-all cursor-pointer"
                            >
                                Add Transaction
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTransactionModal;