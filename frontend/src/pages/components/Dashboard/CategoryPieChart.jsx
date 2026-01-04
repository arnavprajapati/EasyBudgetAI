import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryPieChart = ({ categoryData, selectedView, onCategorySelect }) => {
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
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                            currentPage === 1
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
                                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                                        currentPage === pageNum
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
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                            currentPage === totalPages
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