import React from 'react';

const RecentTransactions = ({
    recentExpenses,
    categoryData,
    selectedCategory,
    selectedView,
    onCategoryChange
}) => {
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

    const filteredExpenses = recentExpenses.filter(expense => {
        const categoryMatch = selectedCategory === 'all' || expense.category === selectedCategory;
        const viewMatch = selectedView === 'all' || expense.type === selectedView;
        return categoryMatch && viewMatch;
    });

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E0E0E0] p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#212529]">Recent Transactions</h2>
                <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="px-4 py-2 border border-[#E0E0E0] rounded-lg font-bold text-sm text-[#212529] focus:border-[#4F9CF9] focus:outline-none cursor-pointer bg-white"
                >
                    <option className="font-bold cursor-pointer" value="all">All Categories</option>
                    {categoryData.map((category, index) => (
                        <option className="font-bold cursor-pointer" key={index} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-3 font-bold max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
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
                        <p className="text-[#828282] font-bold">No transactions found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentTransactions;