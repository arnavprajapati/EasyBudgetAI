import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, ChevronRight, Search, RefreshCw } from 'lucide-react';
import api from '../../../apiIntercepter';
import { toast } from 'react-toastify';
import PartyDetailModal from './PartyDetailModal';

const PartyManagement = () => {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParty, setSelectedParty] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchParties();
    }, []);

    const fetchParties = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/v1/expense/parties?limit=50');
            setParties(data.parties || []);
        } catch (error) {
            // toast.error('Failed to load parties');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredParties = parties.filter(party =>
        party.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePartyClick = (party) => {
        setSelectedParty(party);
        setShowDetailModal(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getBalanceColor = (balance) => {
        if (balance > 0) return 'text-green-600';
        if (balance < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getBalanceLabel = (balance) => {
        if (balance > 0) return 'will receive';
        if (balance < 0) return 'will give';
        return 'settled';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-purple-500 p-3 rounded-full">
                        <Users size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Party / Khata</h2>
                        <p className="text-sm text-gray-500 font-bold">Manage your contacts & balances</p>
                    </div>
                </div>
                <button
                    onClick={fetchParties}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                    <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="px-6 py-4 border-b border-gray-50">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search parties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-purple-300 focus:bg-white transition-all"
                    />
                </div>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : filteredParties.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-bold">
                            {searchQuery ? 'No parties found matching your search' : 'No parties yet'}
                        </p>
                        <p className="text-gray-400 font-semibold text-sm mt-1">
                            Parties are automatically detected from your Telegram transactions
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredParties.map((party, index) => (
                            <div
                                key={index}
                                onClick={() => handlePartyClick(party)}
                                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {party.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-800">{party.name}</h3>
                                        <p className="text-sm text-gray-500 font-bold">
                                            {party.count} transaction{party.count !== 1 ? 's' : ''} • Last: {formatDate(party.lastActivity)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className={`font-bold ${getBalanceColor(party.netBalance)}`}>
                                            {formatCurrency(Math.abs(party.netBalance || 0))}
                                        </p>
                                        <p className="text-xs text-gray-400 capitalize">
                                            {getBalanceLabel(party.netBalance)}
                                        </p>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredParties.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={18} className="text-green-600" />
                                    <span className="text-sm font-bold text-green-700">To Receive</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(
                                        filteredParties.reduce((sum, p) => sum + (p.toReceive || 0), 0)
                                    )}
                                </p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown size={18} className="text-red-600" />
                                    <span className="text-sm font-bold text-red-700">To Give</span>
                                </div>
                                <p className="text-2xl font-bold text-red-600">
                                    {formatCurrency(
                                        filteredParties.reduce((sum, p) => sum + (p.toGive || 0), 0)
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
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
        </div>
    );
};

export default PartyManagement;
