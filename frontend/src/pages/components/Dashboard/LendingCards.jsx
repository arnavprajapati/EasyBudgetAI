import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, User, ChevronRight } from 'lucide-react';
import api from '../../../apiIntercepter';
import { toast } from 'react-toastify';

const LendingCards = () => {
    const [lendingSummary, setLendingSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLendingSummary();
    }, []);

    const fetchLendingSummary = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/v1/lending/summary');
            setLendingSummary(response.data.summary);
        } catch (error) {
            console.error('Failed to fetch lending summary:', error);
            // toast.error('Failed to load lending data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E0E0E0] p-6 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!lendingSummary) {
        return null;
    }

    const hasLendings = lendingSummary.toLend > 0 || lendingSummary.toBorrow > 0;

    if (!hasLendings) {
        return (
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E0E0E0] p-8 mb-6 text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-[#00D563]/10 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">✅</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#212529] mb-2">All Settled!</h3>
                    <p className="text-sm font-bold text-[#828282]">
                        No pending lendings or borrowings
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* To Collect Card - Money you lent (they owe you) */}
            <div className="bg-gradient-to-br from-[#00D563]/5 to-[#00D563]/10 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#00D563]/30 p-6 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-[#00D563] rounded-lg flex items-center justify-center">
                                <TrendingUp size={20} className="text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-[#212529]">To Collect</h3>
                        </div>
                        <p className="text-xs font-bold text-[#828282]">
                            Money you lent (they owe you)
                        </p>
                    </div>
                    <div className="px-3 py-1 bg-[#00D563]/20 rounded-full">
                        <span className="text-xs font-bold text-[#00D563]">
                            {lendingSummary.lentCount} {lendingSummary.lentCount === 1 ? 'person' : 'people'}
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-[#00D563]">
                            ₹{lendingSummary.toLend.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>

                {lendingSummary.lentPersons && lendingSummary.lentPersons.length > 0 && (
                    <div className="space-y-2 mt-4">
                        <div className="text-xs font-bold text-[#828282] mb-2">
                            Top debtors:
                        </div>
                        {lendingSummary.lentPersons.slice(0, 3).map((person, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2.5 bg-white/80 rounded-lg hover:bg-white transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#00D563]/10 rounded-full flex items-center justify-center">
                                        <User size={14} className="text-[#00D563]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#212529]">{person.name}</p>
                                        <p className="text-xs font-bold text-[#828282]">
                                            {new Date(person.date).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold text-[#00D563]">
                                        ₹{person.amount.toLocaleString('en-IN')}
                                    </span>
                                    <ChevronRight size={14} className="text-[#828282]" />
                                </div>
                            </div>
                        ))}
                        {lendingSummary.lentCount > 3 && (
                            <button className="w-full text-center text-xs font-bold text-[#00D563] hover:underline py-2">
                                View all {lendingSummary.lentCount} people
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* To Pay Back Card - Money you borrowed (you owe them) */}
            <div className="bg-gradient-to-br from-[#FF3B3B]/5 to-[#FF3B3B]/10 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#FF3B3B]/30 p-6 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-[#FF3B3B] rounded-lg flex items-center justify-center">
                                <TrendingDown size={20} className="text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-[#212529]">To Pay Back</h3>
                        </div>
                        <p className="text-xs font-bold text-[#828282]">
                            Money you borrowed (you owe them)
                        </p>
                    </div>
                    <div className="px-3 py-1 bg-[#FF3B3B]/20 rounded-full">
                        <span className="text-xs font-bold text-[#FF3B3B]">
                            {lendingSummary.borrowedCount} {lendingSummary.borrowedCount === 1 ? 'person' : 'people'}
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-[#FF3B3B]">
                            ₹{lendingSummary.toBorrow.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>

                {lendingSummary.borrowedPersons && lendingSummary.borrowedPersons.length > 0 && (
                    <div className="space-y-2 mt-4">
                        <div className="text-xs font-bold text-[#828282] mb-2">
                            Top creditors:
                        </div>
                        {lendingSummary.borrowedPersons.slice(0, 3).map((person, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2.5 bg-white/80 rounded-lg hover:bg-white transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#FF3B3B]/10 rounded-full flex items-center justify-center">
                                        <User size={14} className="text-[#FF3B3B]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#212529]">{person.name}</p>
                                        <p className="text-xs font-bold text-[#828282]">
                                            {new Date(person.date).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold text-[#FF3B3B]">
                                        ₹{person.amount.toLocaleString('en-IN')}
                                    </span>
                                    <ChevronRight size={14} className="text-[#828282]" />
                                </div>
                            </div>
                        ))}
                        {lendingSummary.borrowedCount > 3 && (
                            <button className="w-full text-center text-xs font-bold text-[#FF3B3B] hover:underline py-2">
                                View all {lendingSummary.borrowedCount} people
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LendingCards;