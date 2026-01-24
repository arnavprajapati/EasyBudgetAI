import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import api from '../../../apiIntercepter';
import { toast } from 'react-toastify';
import analytics from '../../../utils/analytics';

const EditTransactionModal = ({ isOpen, onClose, onSuccess, transaction }) => {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: 'Miscellaneous',
        type: 'debit',
        date: ''
    });
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const categories = formData.type === 'debit' ? debitCategories : creditCategories;

    useEffect(() => {
        if (transaction) {
            const txnDate = new Date(transaction.date);
            const formattedDate = txnDate.toISOString().split('T')[0];
            
            setFormData({
                amount: transaction.amount || '',
                description: transaction.description || '',
                category: transaction.category || 'Miscellaneous',
                type: transaction.type || 'debit',
                date: formattedDate
            });
        }
    }, [transaction]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!transaction?._id) return;

        setIsSubmitting(true);
        try {
            await api.put(`/api/v1/expense/${transaction._id}`, {
                amount: parseFloat(formData.amount),
                description: formData.description,
                category: formData.category,
                type: formData.type,
                date: formData.date
            });
            analytics.editTransaction(formData.type, parseFloat(formData.amount), formData.category);
            // toast.success('Transaction updated successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            // toast.error(error.response?.data?.message || 'Failed to update transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCurrentCategoryLabel = () => {
        const cat = categories.find(c => c.value === formData.category);
        return cat ? cat.label : categories[0]?.label || 'Select Category';
    };

    if (!isOpen || !transaction) return null;

    return (
        <div className="fixed inset-0 bg-opacity-70 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-7">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[#212529]">Edit Transaction</h2>
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
                                    onClick={() => setFormData({ ...formData, type: 'credit', category: 'Salary & Income' })}
                                    className={`py-3.5 rounded-lg font-bold transition-all text-sm cursor-pointer ${formData.type === 'credit'
                                            ? 'bg-[#00D563] text-white'
                                            : 'bg-[#F5F5F5] text-[#4F4F4F] hover:bg-[#EEEEEE]'
                                        }`}
                                >
                                    💰 Credit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'debit', category: 'Miscellaneous' })}
                                    className={`py-3.5 rounded-lg font-bold transition-all text-sm cursor-pointer ${formData.type === 'debit'
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
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg font-bold text-[#212529] placeholder:text-[#BDBDBD] focus:border-[#4F9CF9] focus:outline-none bg-white"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#828282] mb-2">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg font-bold text-[#212529] placeholder:text-[#BDBDBD] focus:border-[#4F9CF9] focus:outline-none bg-white"
                                placeholder="What did you spend on?"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#828282] mb-2">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg font-bold text-[#212529] focus:border-[#4F9CF9] focus:outline-none bg-white"
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
                                    <div className="absolute left-0 right-0 bottom-full mb-2 bg-white border-2 border-[#E0E0E0] rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, category: cat.value });
                                                    setCategoryOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 font-bold text-sm transition-all cursor-pointer ${
                                                    formData.category === cat.value
                                                        ? 'bg-[#4F9CF9] text-white'
                                                        : 'text-[#212529] hover:bg-[#F5F5F5]'
                                                }`}
                                            >
                                                {cat.label}
                                                {formData.category === cat.value && (
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
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-[#F5F5F5] text-[#4F4F4F] rounded-lg font-bold hover:bg-[#EEEEEE] transition-all cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-[#387ED1] text-white rounded-lg font-bold hover:bg-[#2d6ab8] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTransactionModal;
