import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const CategoryBarChart = ({ chartData, selectedView }) => {
    const getBarColor = () => {
        if (selectedView === 'credit') return '#00D563';
        if (selectedView === 'debit') return '#FF3B3B';
        return '#4F9CF9';
    };

    const getTitle = () => {
        if (selectedView === 'all') return 'All Categories Breakdown';
        if (selectedView === 'credit') return 'Income Sources';
        return 'Expense Categories';
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E0E0E0] p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#212529]">{getTitle()}</h2>
                <div className={`px-4 py-2 rounded-lg font-bold text-sm ${selectedView === 'credit' ? 'bg-[#00D563]/10 text-[#00D563]' :
                        selectedView === 'debit' ? 'bg-[#FF3B3B]/10 text-[#FF3B3B]' :
                            'bg-[#4F9CF9]/10 text-[#4F9CF9]'
                    }`}>
                    {chartData.length} Categories
                </div>
            </div>

            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                        <XAxis
                            dataKey="category"
                            tick={{ fill: '#4F4F4F', fontSize: 12, fontWeight: 'bold' }}
                            angle={-45}
                            textAnchor="end"
                            height={120}
                        />
                        <YAxis
                            tick={{ fill: '#4F4F4F', fontSize: 12, fontWeight: 'bold' }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '2px solid #E0E0E0',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }}
                            formatter={(value, name, props) => [
                                `₹${value.toLocaleString('en-IN')}`,
                                `${props.payload.count} transactions`
                            ]}
                            labelStyle={{ color: '#212529', fontWeight: 'bold', marginBottom: '8px' }}
                        />
                        <Bar
                            dataKey="amount"
                            fill={getBarColor()}
                            radius={[8, 8, 0, 0]}
                            maxBarSize={80}
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-64">
                    <p className="text-[#828282] font-bold">No data available for this view</p>
                </div>
            )}
        </div>
    );
};

export default CategoryBarChart;