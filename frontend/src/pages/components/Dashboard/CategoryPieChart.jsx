import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryPieChart = ({ categoryData, selectedView, onCategorySelect, selectedCategory }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [categoryData]);

    const getPieChartTitle = () => {
        if (selectedView === 'credit') return 'Income Breakdown';
        if (selectedView === 'debit') return 'Expense Breakdown';
        return 'All Categories Breakdown';
    };

    const totalPages = Math.ceil(categoryData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCategories = categoryData.slice(startIndex, endIndex);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E0E0E0] p-6 overflow-visible">
            <h2 className="text-xl font-bold text-[#212529] mb-6">{getPieChartTitle()}</h2>

            {categoryData.length > 0 ? (
                <>
                    <div className="relative overflow-visible" style={{ margin: '0 -20px' }}>
                        <ResponsiveContainer width="100%" height={400} style={{ margin: '0 -20px' }}>
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    dataKey="value"
                                    stroke="#fff"
                                    strokeWidth={2}
                                    paddingAngle={2}
                                    minAngle={27}
                                    labelLine={true}
                                    label={({ cx, cy, midAngle, outerRadius, value, name, index }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = outerRadius + 35;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                        const isRightSide = x > cx;
                                        const textAnchor = isRightSide ? 'start' : 'end';
                                        const shortName = name.split(' ')[0];

                                        return (
                                            <g>
                                                <line
                                                    x1={cx + outerRadius * Math.cos(-midAngle * RADIAN)}
                                                    y1={cy + outerRadius * Math.sin(-midAngle * RADIAN)}
                                                    x2={x}
                                                    y2={y}
                                                    stroke={categoryData[index].color}
                                                    strokeWidth={2}
                                                />
                                                <text
                                                    x={x + (isRightSide ? 10 : -10)}
                                                    y={y + 4}
                                                    fill={categoryData[index].color}
                                                    textAnchor={textAnchor}
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {shortName}
                                                </text>
                                            </g>
                                        );
                                    }}
                                >
                                    {categoryData.map((entry, index) => {
                                        const isSelected = selectedCategory === 'all' || selectedCategory === entry.name;
                                        return (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color} 
                                                opacity={isSelected ? 1 : 0.3}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => onCategorySelect(selectedCategory === entry.name ? 'all' : entry.name)}
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0];
                                            const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
                                            const percentage = ((data.value / total) * 100).toFixed(1);
                                            return (
                                                <div style={{
                                                    backgroundColor: '#fff',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                    padding: '12px 20px',
                                                    minWidth: '160px',
                                                    cursor: 'pointer'
                                                }}>
                                                    <p style={{ 
                                                        fontWeight: 'bold', 
                                                        fontSize: '14px', 
                                                        color: data.payload.color,
                                                        marginBottom: '6px'
                                                    }}>
                                                        {data.name}
                                                    </p>
                                                    <p style={{ 
                                                        fontWeight: 'bold', 
                                                        fontSize: '18px', 
                                                        color: '#212529',
                                                        marginBottom: '4px'
                                                    }}>
                                                        ₹{data.value.toLocaleString('en-IN')}
                                                    </p>
                                                    <p style={{ 
                                                        fontWeight: '600', 
                                                        fontSize: '13px', 
                                                        color: '#828282'
                                                    }}>
                                                        {percentage}% of total
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 space-y-2" style={{ minHeight: '280px' }}>
                        {currentCategories.map((category, index) => {
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

                    {categoryData.length > itemsPerPage && (
                        <div className="mt-4 border-t-2 border-[#F0F0F0] pt-4">
                            <div className="text-xs text-center font-bold text-[#828282] mb-3">
                                Showing {startIndex + 1}-{Math.min(endIndex, categoryData.length)} of {categoryData.length}
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${currentPage === 1
                                            ? 'bg-[#F5F5F5] text-[#BDBDBD] cursor-not-allowed'
                                            : 'bg-white border-2 border-[#E0E0E0] text-[#212529] hover:border-[#4F9CF9] cursor-pointer'
                                            }`}
                                    >
                                        <ChevronLeft size={14} />
                                        Prev
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {currentPage > 2 && (
                                            <>
                                                <button
                                                    onClick={() => goToPage(1)}
                                                    className="px-3 py-1.5 rounded-lg font-bold text-xs transition-all bg-white border-2 border-[#E0E0E0] text-[#212529] hover:border-[#4F9CF9] cursor-pointer"
                                                >
                                                    1
                                                </button>
                                                {currentPage > 3 && (
                                                    <span className="px-1 text-[#828282] font-bold text-xs">...</span>
                                                )}
                                            </>
                                        )}

                                        {[currentPage - 1, currentPage, currentPage + 1].map((pageNum) => {
                                            if (pageNum < 1 || pageNum > totalPages) return null;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${currentPage === pageNum
                                                        ? 'bg-[#4F9CF9] text-white'
                                                        : 'bg-white border-2 border-[#E0E0E0] text-[#212529] hover:border-[#4F9CF9] cursor-pointer'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        {currentPage < totalPages - 1 && (
                                            <>
                                                {currentPage < totalPages - 2 && (
                                                    <span className="px-1 text-[#828282] font-bold text-xs">...</span>
                                                )}
                                                <button
                                                    onClick={() => goToPage(totalPages)}
                                                    className="px-3 py-1.5 rounded-lg font-bold text-xs transition-all bg-white border-2 border-[#E0E0E0] text-[#212529] hover:border-[#4F9CF9] cursor-pointer"
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${currentPage === totalPages
                                            ? 'bg-[#F5F5F5] text-[#BDBDBD] cursor-not-allowed'
                                            : 'bg-white border-2 border-[#E0E0E0] text-[#212529] hover:border-[#4F9CF9] cursor-pointer'
                                            }`}
                                    >
                                        Next
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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