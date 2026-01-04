import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiIntercepter';
import { toast } from 'react-toastify';

// Import components
import ViewTabs from './components/Dashboard/ViewTabs';
import CategoryBarChart from './components/Dashboard/CategoryBarChart';
import CategoryPieChart from './components/Dashboard/CategoryPieChart';
import RecentTransactions from './components/Dashboard/RecentTransactions';
import AddTransactionModal from './components/Dashboard/AddTransactionModal';
import TimeFilter from './components/Dashboard/TimeFilter';
import { Plus } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
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

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [summaryRes, expensesRes] = await Promise.all([
                api.get(`/api/v1/expense/summary?period=${period}`),
                api.get('/api/v1/expense/all?limit=1000')
            ]);

            setSummary(summaryRes.data);
            setRecentExpenses(expensesRes.data.expenses);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
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
            'Travel & Transport': '#4ECDC4',
            'Shopping & Entertainment': '#95E1D3',
            'Housing / Rent': '#F38181',
            'Bills & Utilities': '#AA96DA',
            'Personal & Transfers': '#FCBAD3',
            'Miscellaneous': '#FFB84D',
            'Salary & Income': '#00D563',
            'Refunds & Returns': '#4F9CF9',
            'Received from Others': '#FFA726'
        };

        let filtered = expenses;
        if (selectedView === 'credit') {
            filtered = expenses.filter(expense => expense.type === 'credit');
        } else if (selectedView === 'debit') {
            filtered = expenses.filter(expense => expense.type === 'debit');
        }

        filtered.forEach(expense => {
            if (!categoryMap[expense.category]) {
                categoryMap[expense.category] = {
                    name: expense.category,
                    value: 0,
                    color: categoryColors[expense.category] || '#BDBDBD'
                };
            }
            categoryMap[expense.category].value += expense.amount;
        });

        const data = Object.values(categoryMap)
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);

        setCategoryData(data);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4F9CF9] mx-auto"></div>
                    <p className="mt-4 text-[#4F4F4F] font-bold">Loading your financial insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-16 px-6">
            <div className="max-w-7xl mx-auto">

                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-5xl font-bold text-[#212529]">
                        Welcome back, <span className="text-[#4F9CF9]">Arnav</span>!
                    </h1>
                    <div className="flex items-center gap-3">
                        <TimeFilter 
                            selectedPeriod={period}
                            onPeriodChange={setPeriod}
                        />
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-[#1E1E1E] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#000000] transition-all text-sm shadow-lg cursor-pointer"
                        >
                            <Plus size={20} />
                            Add Transaction
                        </button>
                    </div>
                </div>

                <ViewTabs
                    selectedView={selectedView}
                    onViewChange={setSelectedView}
                />

                <CategoryBarChart
                    chartData={chartData}
                    selectedView={selectedView}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CategoryPieChart
                        categoryData={categoryData}
                        selectedView={selectedView}
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