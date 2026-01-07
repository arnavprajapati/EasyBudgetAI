import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../apiIntercepter';
import PartyDetailModal from './PartyDetailModal';

const PartyQuickView = () => {
    const navigate = useNavigate();
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedParty, setSelectedParty] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [summary, setSummary] = useState({
        toReceive: 0,
        toGive: 0
    });

    useEffect(() => {
        fetchParties();
    }, []);

    const fetchParties = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/v1/expense/parties?limit=6');
            const partiesList = data.parties || [];
            setParties(partiesList);

            const toReceive = partiesList.reduce((sum, p) => sum + (p.toReceive || 0), 0);
            const toGive = partiesList.reduce((sum, p) => sum + (p.toGive || 0), 0);

            setSummary({ toReceive, toGive });
        } catch (error) {
            console.error('Failed to load parties:', error);
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

    const getBalanceColor = (balance) => {
        if (balance > 0) return 'text-green-600';
        if (balance < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const handlePartyClick = (party) => {
        setSelectedParty(party);
        setShowDetailModal(true);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E0E0E0] p-6">
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    if (parties.length === 0) {
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E0E0E0] p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-500 p-2.5 rounded-lg">
                            <Users size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#212529]">Party / Khata</h2>
                            <p className="text-sm font-bold text-gray-500">Your contacts & balances</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/party')}
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-bold text-sm cursor-pointer transition-colors"
                    >
                        View All <ArrowRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={16} className="text-green-600" />
                            <span className="text-xs font-bold  font-bold text-green-700">To Receive</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.toReceive)}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown size={16} className="text-red-600" />
                            <span className="text-xs font-bold  font-bold text-red-700">To Give</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.toGive)}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {parties.slice(0, 5).map((party, index) => (
                        <div
                            key={index}
                            onClick={() => handlePartyClick(party)}
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {party.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">{party.name}</h3>
                                    <p className="text-xs font-bold  text-gray-400">{party.count} txn{party.count !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${getBalanceColor(party.netBalance)}`}>
                                    {party.netBalance >= 0 ? '+' : ''}{formatCurrency(party.netBalance || 0)}
                                </span>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold  text-gray-400 text-center">
                        💡 Send transactions via Telegram: Simply message
                        “Paid 500 to Rajesh” or “Received 1000 from Priya”
                    </p>
                </div>
            </div>

            {showDetailModal && selectedParty && (
                <PartyDetailModal
                    party={selectedParty}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedParty(null);
                    }}
                />
            )}
        </>
    );
};

export default PartyQuickView;
