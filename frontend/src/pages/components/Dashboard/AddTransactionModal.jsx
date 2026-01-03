import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../../apiIntercepter';
import { toast } from 'react-toastify';

const AddTransactionModal = ({ isOpen, onClose, onSuccess }) => {
    const [newExpense, setNewExpense] = useState({
        amount: '',
        description: '',
        category: 'Miscellaneous',
        type: 'debit'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/v1/expense/add', newExpense);
            toast.success('Transaction added successfully!');
            setNewExpense({ amount: '', description: '', category: 'Miscellaneous', type: 'debit' });
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add transaction');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-7">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[#212529]">Add New Transaction</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-all cursor-pointer font-bold"
                        >
                            <X size={22} className="text-[#828282]" />
                        </button>
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
                            <select
                                value={newExpense.category}
                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg font-bold text-[#212529] focus:border-[#4F9CF9] focus:outline-none cursor-pointer bg-white"
                            >
                                {newExpense.type === 'debit' ? (
                                    <>
                                        <option className="font-bold cursor-pointer" value="Food & Dining">🍽️ Food & Dining</option>
                                        <option className="font-bold cursor-pointer" value="Travel & Transport">🚗 Travel & Transport</option>
                                        <option className="font-bold cursor-pointer" value="Shopping & Entertainment">🛍️ Shopping & Entertainment</option>
                                        <option className="font-bold cursor-pointer" value="Housing / Rent">🏠 Housing / Rent</option>
                                        <option className="font-bold cursor-pointer" value="Bills & Utilities">📱 Bills & Utilities</option>
                                        <option className="font-bold cursor-pointer" value="Personal & Transfers">💸 Personal & Transfers</option>
                                        <option className="font-bold cursor-pointer" value="Miscellaneous">📦 Miscellaneous</option>
                                    </>
                                ) : (
                                    <>
                                        <option className="font-bold cursor-pointer" value="Salary & Income">💼 Salary & Income</option>
                                        <option className="font-bold cursor-pointer" value="Refunds & Returns">↩️ Refunds & Returns</option>
                                        <option className="font-bold cursor-pointer" value="Received from Others">🤝 Received from Others</option>
                                    </>
                                )}
                            </select>
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