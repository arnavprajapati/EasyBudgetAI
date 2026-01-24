import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../apiIntercepter';
import { toast } from 'react-toastify';

import ViewTabs from './components/Dashboard/ViewTabs';
import CategoryBarChart from './components/Dashboard/CategoryBarChart';
import CategoryPieChart from './components/Dashboard/CategoryPieChart';
import RecentTransactions from './components/Dashboard/RecentTransactions';
import AddTransactionModal from './components/Dashboard/AddTransactionModal';
import TimeFilter from './components/Dashboard/TimeFilter';
import { Plus, BookOpen, RefreshCw } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState('month');
    const [summary, setSummary] = useState(null);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedView, setSelectedView] = useState('all');
    const [filteredExpenses, setFilteredExpenses] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (recentExpenses.length > 0) {
            filterExpensesByPeriod();
        }
    }, [period, recentExpenses]);

    useEffect(() => {
        if (filteredExpenses.length > 0) {
            generateChartData(filteredExpenses);
            generateCategoryData(filteredExpenses);
        } else {
            setChartData([]);
            setCategoryData([]);
        }
    }, [selectedView, filteredExpenses]);

    const filterExpensesByPeriod = () => {
        const now = new Date();
        let filtered = [];

        switch (period) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = recentExpenses.filter(exp => new Date(exp.date) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filtered = recentExpenses.filter(exp => new Date(exp.date) >= monthAgo);
                break;
            case '3months':
                const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                filtered = recentExpenses.filter(exp => new Date(exp.date) >= threeMonthsAgo);
                break;
            case '6months':
                const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                filtered = recentExpenses.filter(exp => new Date(exp.date) >= sixMonthsAgo);
                break;
            case 'all':
                filtered = recentExpenses;
                break;
            default:
                filtered = recentExpenses;
        }

        setFilteredExpenses(filtered);
    };

    const fetchDashboardData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const [summaryRes, expensesRes] = await Promise.all([
                api.get(`/api/v1/expense/summary?period=${period}`),
                api.get('/api/v1/expense/all?limit=1000')
            ]);

            setSummary(summaryRes.data);
            setRecentExpenses(expensesRes.data.expenses);
        } catch (error) {
            // toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const generateChartData = (expenses) => {
        const categoryMap = {};

        let filtered = expenses;
        if (selectedView === 'credit') {
            filtered = expenses.filter(e => e.type === 'credit');
        } else if (selectedView === 'debit') {
            filtered = expenses.filter(e => e.type === 'debit');
        }

        filtered.forEach(expense => {
            if (!categoryMap[expense.category]) {
                categoryMap[expense.category] = {
                    category: expense.category,
                    amount: 0,
                    count: 0
                };
            }
            categoryMap[expense.category].amount += expense.amount;
            categoryMap[expense.category].count += 1;
        });

        const data = Object.values(categoryMap)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);

        setChartData(data);
    };

    const generateCategoryData = (expenses) => {
        const categoryMap = {};
        
        const categoryColors = {
            'Food & Dining': '#FF6B6B',
            'Food': '#FF6B6B',
            'Dining': '#E85D5D',
            'Travel & Transport': '#4ECDC4',
            'Travel': '#4ECDC4',
            'Transport': '#38B2AC',
            'Transportation': '#38B2AC',
            'Shopping & Entertainment': '#9F7AEA',
            'Shopping': '#9F7AEA',
            'Entertainment': '#B794F6',
            'Housing / Rent': '#F687B3',
            'Housing': '#F687B3',
            'Rent': '#ED64A6',
            'Bills & Utilities': '#F6AD55',
            'Bills': '#F6AD55',
            'Utilities': '#ED8936',
            'Personal & Transfers': '#63B3ED',
            'Personal': '#63B3ED',
            'Transfers': '#4299E1',
            'Miscellaneous': '#FC8181',
            'Other': '#A0AEC0',
            'Healthcare': '#48BB78',
            'Health': '#48BB78',
            'Medical': '#38A169',
            'Education': '#667EEA',
            'Groceries': '#68D391',
            'Grocery': '#68D391',
            'Fuel': '#FBD38D',
            'Petrol': '#FBD38D',
            'Investment': '#805AD5',
            'Investments': '#805AD5',
            
            'Salary & Income': '#00D563',
            'Salary': '#00D563',
            'Income': '#38A169',
            'Refunds & Returns': '#4F9CF9',
            'Refund': '#4F9CF9',
            'Refunds': '#4F9CF9',
            'Returns': '#3182CE',
            'Received from Others': '#FFA726',
            'Received': '#FFA726',
            'Bonus': '#F6E05E',
            'Freelance': '#9AE6B4',
            'Interest': '#90CDF4',
            'Dividend': '#C4B5FD',
            'Gift': '#FBB6CE'
        };

        const fallbackColors = [
            '#FF6B6B', '#4ECDC4', '#9F7AEA', '#F687B3', '#F6AD55',
            '#63B3ED', '#48BB78', '#FBD38D', '#FC8181', '#667EEA',
            '#68D391', '#805AD5', '#00D563', '#FFA726', '#F6E05E',
            '#90CDF4', '#FBB6CE', '#C4B5FD', '#9AE6B4', '#ED8936'
        ];

        let filtered = expenses;
        if (selectedView === 'credit') {
            filtered = expenses.filter(expense => expense.type === 'credit');
        } else if (selectedView === 'debit') {
            filtered = expenses.filter(expense => expense.type === 'debit');
        }

        let colorIndex = 0;
        filtered.forEach(expense => {
            if (!categoryMap[expense.category]) {
                let color = categoryColors[expense.category];
                if (!color) {
                    color = fallbackColors[colorIndex % fallbackColors.length];
                    colorIndex++;
                }
                
                categoryMap[expense.category] = {
                    name: expense.category,
                    value: 0,
                    color: color
                };
            }
            categoryMap[expense.category].value += expense.amount;
        });

        const data = Object.values(categoryMap)
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);

        setCategoryData(data);
    };

    return (
        <div className="min-h-screen bg-white py-6 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">

                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Spending Insights & Analysis
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <TimeFilter
                            selectedPeriod={period}
                            onPeriodChange={setPeriod}
                        />
                        <button
                            onClick={() => navigate('/party')}
                            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-3 md:px-4 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap cursor-pointer "
                        >
                            <BookOpen size={18} />
                            <span className="hidden sm:inline">Khata Book</span>
                            <span className="sm:hidden">Khata</span>
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-3 md:px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Add Transaction</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                <ViewTabs
                    selectedView={selectedView}
                    onViewChange={setSelectedView}
                />

                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E0E0E0] p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[#212529]">
                            {selectedView === 'all' ? 'All Categories Breakdown' : selectedView === 'credit' ? 'Income Sources' : 'Expense Categories'}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fetchDashboardData(true)}
                                disabled={refreshing}
                                className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                title="Refresh data"
                            >
                                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            </button>
                            <div className={`px-4 py-2 rounded-lg font-bold text-sm ${selectedView === 'credit' ? 'bg-[#00D563]/10 text-[#00D563]' :
                                    selectedView === 'debit' ? 'bg-[#FF3B3B]/10 text-[#FF3B3B]' :
                                        'bg-[#4F9CF9]/10 text-[#4F9CF9]'
                                }`}>
                                {chartData.length} Categories
                            </div>
                        </div>
                    </div>
                    <CategoryBarChart
                        chartData={chartData}
                        selectedView={selectedView}
                        hideHeader={true}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CategoryPieChart
                        categoryData={categoryData}
                        selectedView={selectedView}
                        selectedCategory={selectedCategory}
                        onCategorySelect={setSelectedCategory}
                    />

                    <RecentTransactions
                        recentExpenses={filteredExpenses}
                        categoryData={categoryData}
                        selectedCategory={selectedCategory}
                        selectedView={selectedView}
                        onCategoryChange={setSelectedCategory}
                    />
                </div>
            </div>

            <AddTransactionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchDashboardData}
            />
        </div>
    );
};

export default Dashboard;