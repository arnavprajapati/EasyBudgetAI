import React from 'react';
import { Plus } from 'lucide-react';

const DashboardHeader = ({ onAddTransaction }) => {
    return (
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-5xl font-bold text-[#212529]">
                Welcome back, <span className="text-[#4F9CF9]">Arnav</span>!
            </h1>
            <button
                onClick={onAddTransaction}
                className="flex items-center gap-2 bg-[#1E1E1E] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#000000] transition-all text-sm shadow-lg cursor-pointer"
            >
                <Plus size={20} />
                Add Transaction
            </button>
        </div>
    );
};

export default DashboardHeader;