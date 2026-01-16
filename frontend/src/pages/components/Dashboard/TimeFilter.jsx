import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const TimeFilter = ({ selectedPeriod, onPeriodChange, maxPeriod }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const allPeriods = [
        { value: 'week', label: 'Last 7 Days' },
        { value: 'month', label: 'Last Month' },
        { value: '3months', label: 'Last 3 Months' },
        { value: '6months', label: 'Last 6 Months' },
        { value: 'all', label: 'All Time' }
    ];

    const periods = maxPeriod === '3months' 
        ? allPeriods.slice(0, 3) 
        : allPeriods;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getCurrentLabel = () => {
        const period = periods.find(p => p.value === selectedPeriod);
        return period ? period.label : 'Last Month';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white border-2 border-[#E0E0E0] text-[#212529] px-5 py-3 rounded-lg font-bold hover:border-[#4F9CF9] transition-all text-sm shadow-sm cursor-pointer"
            >
                <span>{getCurrentLabel()}</span>
                <ChevronDown
                    size={18}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#E0E0E0] rounded-lg shadow-xl z-50 overflow-hidden">
                    {periods.map((period) => (
                        <button
                            key={period.value}
                            onClick={() => {
                                onPeriodChange(period.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 font-bold text-sm transition-all cursor-pointer ${selectedPeriod === period.value
                                    ? 'bg-[#4F9CF9] text-white'
                                    : 'text-[#212529] hover:bg-[#F5F5F5]'
                                }`}
                        >
                            {period.label}
                            {selectedPeriod === period.value && (
                                <span className="float-right">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimeFilter;