import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, TrendingDown, ChevronRight, Search, RefreshCw, ArrowLeft } from 'lucide-react';
import api from '../apiIntercepter';
import { toast } from 'react-toastify';
import PartyDetailModal from './components/Dashboard/PartyDetailModal';
import analytics from '../utils/analytics';

const Party = () => {
    const navigate = useNavigate();
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParty, setSelectedParty] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [summary, setSummary] = useState({ toReceive: 0, toGive: 0 });

    useEffect(() => {
        fetchParties();
        analytics.pageView('Khata Book', { totalParties: parties.length });
    }, []);

    const fetchParties = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/v1/expense/parties?limit=100');
            const partiesList = data.parties || [];
            setParties(partiesList);

            const toReceive = partiesList.reduce((sum, p) => sum + (p.toReceive || 0), 0);
            const toGive = partiesList.reduce((sum, p) => sum + (p.toGive || 0), 0);
            setSummary({ toReceive, toGive });
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
        analytics.viewPartyDetails(party.name, party.netBalance);
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
        if (balance > 0) return 'Will Receive';
        if (balance < 0) return 'Will Give';
        return 'Settled';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-500 p-3 rounded-full">
                                <Users size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Party / Khata</h1>
                                <p className="text-gray-500 text-sm font-bold">Manage your contacts & balances</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={20} /> Back
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-2xl shadow-sm border border-green-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <TrendingUp size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-green-700">To Receive</p>
                                    <p className="text-xs font-semibold text-green-600">They owe you</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.toReceive)}</p>
                        </div>
                    </div>
                    <div className="bg-red-50 rounded-2xl shadow-sm border border-red-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <TrendingDown size={20} className="text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-red-700">To Give</p>
                                    <p className="text-xs font-semibold text-red-600">You owe them</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.toGive)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search parties..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-purple-300 focus:bg-white transition-all"
                            />
                        </div>
                        <button
                            onClick={fetchParties}
                            disabled={loading}
                            className="p-3 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-100"
                        >
                            <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="p-4">
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
                            <div className="divide-y divide-gray-100">
                                {filteredParties.map((party, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handlePartyClick(party)}
                                        className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {party.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">{party.name}</h3>
                                                <p className="text-sm font-bold text-gray-500">
                                                    {party.count} transaction{party.count !== 1 ? 's' : ''} • Last: {formatDate(party.lastActivity)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className={`font-bold ${getBalanceColor(party.netBalance)}`}>
                                                    {formatCurrency(Math.abs(party.netBalance || 0))}
                                                </p>
                                                <p className="text-xs font-bold text-gray-400">
                                                    {getBalanceLabel(party.netBalance)}
                                                </p>
                                            </div>
                                            <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
        </div>
    );
};

export default Party;
