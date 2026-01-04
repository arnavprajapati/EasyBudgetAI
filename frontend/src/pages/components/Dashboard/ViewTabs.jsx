import React from 'react';

const ViewTabs = ({ selectedView, onViewChange }) => {
    return (
        <div className="mb-6 flex gap-3">
            <button
                onClick={() => onViewChange('all')}
                className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all cursor-pointer ${selectedView === 'all'
                    ? 'bg-[#4F9CF9] text-white shadow-lg'
                    : 'bg-white border-2 border-[#E0E0E0] text-[#4F4F4F] hover:border-[#4F9CF9]'
                    }`}
            >
                💰 All Transactions
            </button>
            <button
                onClick={() => onViewChange('debit')}
                className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all cursor-pointer ${selectedView === 'debit'
                    ? 'bg-[#FF3B3B] text-white shadow-lg'
                    : 'bg-white border-2 border-[#E0E0E0] text-[#4F4F4F] hover:border-[#FF3B3B]'
                    }`}
            >
                📉 Debit (Expenses)
            </button>
            <button
                onClick={() => onViewChange('credit')}
                className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all cursor-pointer ${selectedView === 'credit'
                    ? 'bg-[#00D563] text-white shadow-lg'
                    : 'bg-white border-2 border-[#E0E0E0] text-[#4F4F4F] hover:border-[#00D563]'
                    }`}
            >
                📈 Credit (Income)
            </button>

        </div>
    );
};

export default ViewTabs;