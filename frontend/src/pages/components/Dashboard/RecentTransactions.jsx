import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const RecentTransactions = ({
    recentExpenses,
    categoryData,
    selectedCategory,
    selectedView,
    onCategoryChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const dropdownRef = useRef(null);
    const itemsPerPage = 7;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedView]);

    const getCategoryIcon = (category) => {
        const icons = {
            'Food & Dining': '🍽️',
            'Travel & Transport': '🚗',
            'Shopping & Entertainment': '🛍️',
            'Housing / Rent': '🏠',
            'Bills & Utilities': '📱',
            'Personal & Transfers': '💸',
            'Miscellaneous': '📦',
            'Salary & Income': '💼',
            'Refunds & Returns': '↩️',
            'Received from Others': '🤝'
        };
        return icons[category] || '📦';
    };

    const getCurrentLabel = () => {
        if (selectedCategory === 'all') return 'All Categories';
        return selectedCategory;
    };

    const filteredExpenses = recentExpenses.filter(expense => {
        const categoryMatch = selectedCategory === 'all' || expense.category === selectedCategory;
        const viewMatch = selectedView === 'all' || expense.type === selectedView;
        return categoryMatch && viewMatch;
    });

    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E0E0E0] p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#212529]">Recent Transactions</h2>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 bg-white border-2 border-[#E0E0E0] text-[#212529] px-4 py-2 rounded-lg font-bold hover:border-[#4F9CF9] transition-all text-sm shadow-sm cursor-pointer"
                    >
                        <span>{getCurrentLabel()}</span>
                        <ChevronDown
                            size={16}
                            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-[#E0E0E0] rounded-lg shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                            <button
                                onClick={() => {
                                    onCategoryChange('all');
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 font-bold text-sm transition-all cursor-pointer ${
                                    selectedCategory === 'all'
                                        ? 'bg-[#4F9CF9] text-white'
                                        : 'text-[#212529] hover:bg-[#F5F5F5]'
                                }`}
                            >
                                All Categories
                                {selectedCategory === 'all' && (
                                    <span className="float-right">✓</span>
                                )}
                            </button>

                            {categoryData.map((category, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        onCategoryChange(category.name);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 font-bold text-sm transition-all cursor-pointer ${
                                        selectedCategory === category.name
                                            ? 'bg-[#4F9CF9] text-white'
                                            : 'text-[#212529] hover:bg-[#F5F5F5]'
                                    }`}
                                >
                                    {category.name}
                                    {selectedCategory === category.name && (
                                        <span className="float-right">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3 font-bold" style={{ minHeight: '520px' }}>
                {currentExpenses.length > 0 ? (
                    currentExpenses.map((expense) => (
                        <div
                            key={expense._id}
                            className="p-4 cursor-pointer bg-[#FAFAFA] rounded-lg hover:bg-[#F5F5F5] transition-all duration-200"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-2xl font-bold">{getCategoryIcon(expense.category)}</span>
                                    <div>
                                        <p className="font-bold text-[#212529]">{expense.description}</p>
                                        <p className="text-xs font-bold text-[#828282]">{expense.category}</p>
                                        <p className="text-xs font-bold text-[#BDBDBD] mt-1">
                                            {new Date(expense.date).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-1">
                                    <span className={`text-2xl ${expense.type === 'credit' ? 'text-[#00D563]' : 'text-[#FF3B3B]'}`}>
                                        {expense.type === 'credit' ? '↗' : '↘'}
                                    </span>
                                    <p className={`text-xl font-bold ${expense.type === 'credit' ? 'text-[#00D563]' : 'text-[#FF3B3B]'}`}>
                                        ₹{expense.amount.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-[#828282] font-semibold ">No transactions found</p>
                    </div>
                )}
            </div>

            {filteredExpenses.length > 0 && (
                <div className="mt-4 border-t-2 border-[#F0F0F0] pt-4">
                    <div className="text-xs text-center font-bold text-[#828282] mb-3">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length}
                    </div>
                    
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                    currentPage === 1
                                        ? 'bg-[#F5F5F5] text-[#BDBDBD] cursor-not-allowed'
                                        : 'bg-white border-2 border-[#E0E0E0] text-[#212529] hover:border-[#4F9CF9] cursor-pointer'
                                }`}
                            >
                                <ChevronLeft size={14} />
                                Prev
                            </button>

                            <div className="flex items-center gap-1">
                                {currentPage > 2 && (
                                    <>
                                        <button
                                            onClick={() => goToPage(1)}
                                            className="px-3 py-1.5 rounded-lg font-bold text-xs transition-all bg-white border-2 border-[#E0E0E0] text-[#212529] hover:border-[#4F9CF9] cursor-pointer"
                                        >
                                            1
                                        </button>
                                        {currentPage > 3 && (
                                            <span className="px-1 text-[#828282] font-bold text-xs">...</span>
                                        )}
                                    </>
                                )}

                                {[currentPage - 1, currentPage, currentPage + 1].map((pageNum) => {
                                    if (pageNum < 1 || pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                                currentPage === pageNum
                                                    ? 'bg-[#4F9CF9] text-white'
                                                    : 'bg-white border-2 border-[#E0E0E0] text-[#212529] hover:border-[#4F9CF9] cursor-pointer'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {currentPage < totalPages - 1 && (
                                    <>
                                        {currentPage < totalPages - 2 && (
                                            <span className="px-1 text-[#828282] font-bold text-xs">...</span>
                                        )}
                                        <button
                                            onClick={() => goToPage(totalPages)}
                                            className="px-3 py-1.5 rounded-lg font-bold text-xs transition-all bg-white border-2 border-[#E0E0E0] text-[#212529] hover:border-[#4F9CF9] cursor-pointer"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                    currentPage === totalPages
                                        ? 'bg-[#F5F5F5] text-[#BDBDBD] cursor-not-allowed'
                                        : 'bg-white border-2 border-[#E0E0E0] text-[#212529] hover:border-[#4F9CF9] cursor-pointer'
                                }`}
                            >
                                Next
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentTransactions;