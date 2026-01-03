import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const CategoryPieChart = ({ categoryData, selectedView, onCategorySelect }) => {
    const getPieChartTitle = () => {
        if (selectedView === 'credit') return 'Income Breakdown';
        if (selectedView === 'debit') return 'Expense Breakdown';
        return 'All Categories Breakdown';
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E0E0E0] p-6">
            <h2 className="text-xl font-bold text-[#212529] mb-6">{getPieChartTitle()}</h2>

            {categoryData.length > 0 ? (
                <>
                    <div className="relative">
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={110}
                                    dataKey="value"
                                    stroke="#fff"
                                    strokeWidth={3}
                                    paddingAngle={3}
                                    minAngle={15}
                                    labelLine={{
                                        stroke: '#bdbdbd',
                                        strokeWidth: 1.5,
                                        length: 30,
                                        length2: 25,
                                    }}
                                    label={({ name, value, cx, cy, x, y, index }) => {
                                        const shortName = name.split(' ')[0];
                                        const textAnchor = x > cx ? 'start' : 'end';
                                        const yOffset = y + (y > cy ? 12 : -12);
                                        const xOffset = x + (x > cx ? 10 : -10);

                                        return (
                                            <text
                                                x={xOffset}
                                                y={yOffset}
                                                fill={categoryData[index].color}
                                                textAnchor={textAnchor}
                                                dominantBaseline="central"
                                                style={{
                                                    fontWeight: 'bold',
                                                    fontSize: '15px',
                                                }}
                                            >
                                                {`${shortName}: ₹${(value / 1000).toFixed(1)}k`}
                                            </text>
                                        );
                                    }}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        padding: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                        {categoryData.map((category, index) => {
                            const totalAmount = categoryData.reduce((sum, cat) => sum + cat.value, 0);
                            const percentage = ((category.value / totalAmount) * 100).toFixed(1);

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2.5 bg-[#FAFAFA] rounded-lg hover:bg-[#F0F0F0] transition-all cursor-pointer"
                                    onClick={() => onCategorySelect(category.name)}
                                >
                                    <div className="flex items-center gap-2.5 flex-1">
                                        <div
                                            className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                                            style={{ backgroundColor: category.color }}
                                        ></div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-bold text-[#212529] block truncate">
                                                {category.name}
                                            </span>
                                            <span className="text-xs font-bold text-[#828282]">
                                                {percentage}% of total
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-[#212529] ml-2">
                                        ₹{category.value.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-64">
                    <p className="text-[#828282] font-bold">No data available</p>
                </div>
            )}
        </div>
    );
};

export default CategoryPieChart;