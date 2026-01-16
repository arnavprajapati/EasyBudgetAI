import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const DailyTrendChart = ({ expenses }) => {
    const generateDailyData = () => {
        const dailyMap = {};

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const dateKey = date.toISOString().split('T')[0];

            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = {
                    date: dateKey,
                    displayDate: date.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                    }),
                    income: 0,
                    expense: 0
                };
            }

            if (expense.type === 'credit') {
                dailyMap[dateKey].income += expense.amount;
            } else {
                dailyMap[dateKey].expense += expense.amount;
            }
        });

        return Object.values(dailyMap)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-1120);
    };

    const chartData = generateDailyData();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-xl">
                    <p className="font-bold text-gray-800 mb-2">{data.displayDate}</p>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-green-500">
                            Income: ₹{payload.find(p => p.dataKey === 'income')?.value?.toLocaleString('en-IN') || 0}
                        </p>
                        <p className="text-sm font-bold text-red-500">
                            Expense: ₹{payload.find(p => p.dataKey === 'expense')?.value?.toLocaleString('en-IN') || 0}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📈 Daily Spending Trend
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-400 font-semibold">
                    No transaction data available
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📈 Daily Spending Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="displayDate"
                        tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => (
                            <span className="font-bold text-gray-600 text-sm">
                                {value === 'income' ? '💰 Income' : '💸 Expense'}
                            </span>
                        )}
                    />
                    <Bar
                        dataKey="income"
                        fill="#22c55e"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                    />
                    <Bar
                        dataKey="expense"
                        fill="#ef4444"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DailyTrendChart;
