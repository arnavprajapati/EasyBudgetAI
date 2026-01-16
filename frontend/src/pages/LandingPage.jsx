import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AuthModal from './auth/AuthModal';

function LandingPage() {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authView, setAuthView] = useState('login');
    const [activeTab, setActiveTab] = useState('expenses');
    const context = useOutletContext() || {};

    const openAuthModal = (view) => {
        setAuthView(view);
        setShowAuthModal(true);
    };

    useEffect(() => {
        if (context.setOnAuthClick) {
            context.setOnAuthClick(() => openAuthModal);
        }
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const features = [
        {
            icon: '💰',
            title: 'Smart Expense Tracking',
            description: 'Track your expenses effortlessly with AI-powered categorization and insights.'
        },
        {
            icon: '📊',
            title: 'Visual Analytics',
            description: 'Beautiful charts and graphs to understand your spending patterns at a glance.'
        },
        {
            icon: '📱',
            title: 'Telegram Integration',
            description: 'Add expenses on-the-go directly from Telegram bot.'
        },
        {
            icon: '🤝',
            title: 'Khata Book',
            description: 'Manage lending and borrowing with friends and family in one place.'
        },
        {
            icon: '🔔',
            title: 'Smart Reminders',
            description: 'Never miss a payment with intelligent notification system.'
        },
        {
            icon: '🔒',
            title: 'Secure & Private',
            description: 'Bank-level security with end-to-end encryption for your data.'
        }
    ];

    const steps = [
        {
            number: '01',
            title: 'Sign Up',
            description: 'Create your free account in seconds with email verification.'
        },
        {
            number: '02',
            title: 'Link Telegram',
            description: 'Connect your Telegram to track expenses via simple chat messages.'
        },
        {
            number: '03',
            title: 'Track & Analyze',
            description: 'View category-wise insights with beautiful pie charts and bar graphs.'
        },
        {
            number: '04',
            title: 'Manage Khata',
            description: 'Track lending & borrowing with friends - who owes you, whom you owe.'
        }
    ];

    const telegramCommands = [
        { command: '/start', desc: 'Get started & link your account' },
        { command: '/help', desc: 'View all available commands' },
        { command: '/today', desc: "See today's transactions" },
        { command: '/summary', desc: 'Monthly spending summary' },
        { command: '/balance', desc: 'Current month balance' },
        { command: '/status', desc: 'Check account link status' }
    ];

    const expenseExamples = [
        { text: '50 chai pi office mein', category: 'Food & Dining', color: 'bg-orange-500' },
        { text: '200 uber se ghar aaya', category: 'Travel & Transport', color: 'bg-blue-500' },
        { text: '500 grocery liya bazaar se', category: 'Shopping', color: 'bg-pink-500' },
        { text: '1000 bijli ka bill bhara', category: 'Bills & Utilities', color: 'bg-amber-500' },
        { text: '15000 room ka rent diya', category: 'Housing / Rent', color: 'bg-purple-500' }
    ];

    const incomeExamples = [
        { text: '50000 salary aa gayi', category: 'Salary & Income', color: 'bg-green-500' },
        { text: '500 amazon se refund mila', category: 'Refunds & Returns', color: 'bg-teal-500' },
        { text: '2000 Rahul ne wapas kiye', category: 'Received from Others', color: 'bg-sky-500' }
    ];

    const categories = [
        { name: 'Food & Dining', icon: '🍽️', color: 'bg-orange-500', keywords: 'chai, coffee, lunch, dinner, biryani' },
        { name: 'Travel & Transport', icon: '🚗', color: 'bg-blue-500', keywords: 'uber, ola, auto, petrol, metro' },
        { name: 'Shopping', icon: '🛍️', color: 'bg-pink-500', keywords: 'amazon, flipkart, clothes, shopping' },
        { name: 'Bills & Utilities', icon: '📱', color: 'bg-amber-500', keywords: 'electricity, wifi, recharge, bill' },
        { name: 'Housing / Rent', icon: '🏠', color: 'bg-purple-500', keywords: 'rent, maintenance, repair' },
        { name: 'Personal', icon: '💸', color: 'bg-indigo-500', keywords: 'personal, transfer, send' }
    ];

    const dashboardFeatures = [
        {
            title: 'Transaction Overview',
            desc: 'Total Income, Expenses & Net Balance',
            icon: '📊',
            color: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Category Insights',
            desc: 'Pie charts & bar graphs by category',
            icon: '📈',
            color: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Daily Trends',
            desc: 'Track spending patterns over time',
            icon: '📉',
            color: 'from-green-500 to-green-600'
        },
        {
            title: 'Recent Transactions',
            desc: 'Paginated list with filters',
            icon: '📋',
            color: 'from-orange-500 to-orange-600'
        }
    ];

    return (
        <>
            <div className="min-h-screen relative overflow-hidden bg-white">
                <nav className="absolute top-2 md:top-4 left-0 right-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 md:space-x-3">
                                <div className="bg-[#387ED1] p-1.5 md:p-2 rounded-lg md:rounded-xl">
                                    <svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <span className="text-lg md:text-2xl font-extrabold text-gray-900">
                                    Smart<span className="text-[#387ED1]">Khata</span>
                                </span>
                            </div>

                            <div className="hidden md:flex items-center space-x-8">
                                <button onClick={() => scrollToSection('features')} className="text-sm font-bold text-gray-600 hover:text-[#387ED1] transition cursor-pointer">
                                    Features
                                </button>
                                <button onClick={() => scrollToSection('telegram')} className="text-sm font-bold text-gray-600 hover:text-[#387ED1] transition cursor-pointer">
                                    Telegram Bot
                                </button>
                                <button onClick={() => scrollToSection('dashboard')} className="text-sm font-bold text-gray-600 hover:text-[#387ED1] transition cursor-pointer">
                                    Dashboard
                                </button>
                                <button onClick={() => scrollToSection('khata')} className="text-sm font-bold text-gray-600 hover:text-[#387ED1] transition cursor-pointer">
                                    Khata Book
                                </button>
                            </div>

                            <div className="flex items-center space-x-2 md:space-x-4">
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="hidden sm:block text-sm md:text-base font-bold text-gray-600 hover:text-[#387ED1] cursor-pointer px-2 md:px-4 py-2"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => openAuthModal('register')}
                                    className="bg-[#387ED1] text-white text-sm md:text-base font-bold px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl shadow-md hover:shadow-blue-200 transition-all cursor-pointer"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="flex flex-col items-center justify-center max-w-7xl mx-auto px-4 md:px-8 min-h-screen relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between w-full pt-20 md:pt-32 pb-16 md:pb-35">
                        <div className="flex-1 max-w-xl text-left">
                            <div className="flex items-start gap-10 mb-4">
                                <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold leading-tight">
                                    Take Control <br />of <span className='text-[#387ED1]'>Your Money</span>
                                </h1>
                                <div className="w-20 h-20 sm:w-24 sm:h-24 z-10 md:hidden flex-shrink-0 mt-1">
                                    <img
                                        src="https://res.cloudinary.com/dzz1wmydl/image/upload/v1762864750/unnamed_1_dick2v.jpg"
                                        alt="Small Visual"
                                        className="w-full h-full object-contain transform rotate-12"
                                    />
                                </div>
                            </div>
                            <p className="text-gray-600 font-bold text-sm sm:text-base md:text-xl mb-5 md:mb-8 pr-2">
                                Track your expenses effortlessly via Telegram. Manage Khata with friends. Stay in control.
                            </p>
                            <div className="flex flex-row space-x-3 sm:space-x-4 max-w-sm">
                                <button
                                    onClick={() => openAuthModal('register')}
                                    className="flex-1 text-sm sm:text-base md:text-lg py-2.5 md:py-3 rounded-lg font-semibold text-white cursor-pointer bg-[#387ED1] transition duration-200 shadow-lg"
                                >
                                    Get Started Free
                                </button>
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="flex-1 text-sm sm:text-base md:text-lg py-2.5 md:py-3 rounded-lg font-semibold text-gray-800 cursor-pointer bg-gray-200 border border-gray-300 hover:bg-gray-300 transition duration-200 shadow-lg"
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>
                        <div className="hidden md:flex md:flex-1 justify-center items-center mt-10 md:mt-0">
                            <img
                                src="https://res.cloudinary.com/dzz1wmydl/image/upload/v1762864750/unnamed_1_dick2v.jpg"
                                alt="Landing Visual"
                                className="w-full max-w-lg h-auto object-contain transform -rotate-3 hover:rotate-0 transition-transform duration-500"
                            />
                        </div>
                    </div>
                    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <button
                            onClick={() => scrollToSection('features')}
                            className="flex flex-col items-center text-gray-600 hover:text-[#387ED1] transition"
                        >
                            <span className="text-sm font-semibold mb-2 cursor-pointer">Explore Features</span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-0 transform translate-y-4 pointer-events-none">
                    <svg viewBox="0 0 1440 420" className="w-full h-68 md:h-104" preserveAspectRatio="none">
                        <path fill={'#387ED1'} d="M0,250L48,266C96,282,192,314,288,314C384,314,480,282,576,276.7C672,271,768,293,864,298C960,303,1056,293,1152,282C1248,271,1344,261,1392,256.3L1440,250L1440,420L1392,420C1344,420,1248,420,1152,420C1056,420,960,420,864,420C768,420,672,420,576,420C480,420,384,420,288,420C192,420,96,420,48,420L0,420Z"></path>
                    </svg>
                </div>
            </div>

            <section id="features" className="py-10 bg-gradient-to-b from-[#387ED1] to-[#2563eb]">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl font-semibold text-blue-100 max-w-2xl mx-auto">
                            Everything you need to manage your finances effectively
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-xl transition-all duration-300"
                            >
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 font-semibold text-base leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="telegram" className="py-12 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center mb-8 md:mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 md:px-4 py-2 rounded-full text-sm md:text-base font-bold mb-4">
                            <span>📱</span> Telegram Integration
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-800 mb-3 md:mb-4">
                            Track Expenses via <span className="text-[#0088cc]">Telegram</span>
                        </h2>
                        <p className="text-base md:text-xl font-semibold text-gray-600 max-w-2xl mx-auto px-2">
                            No app needed! Just message our bot and your expenses are saved automatically
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
                        <div className="bg-gradient-to-br from-[#0088cc] to-[#0066aa] rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl text-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">🤖</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Bot Commands</h3>
                                    <p className="text-blue-100 text-bas font-semibold">Quick actions at your fingertips</p>
                                </div>
                            </div>
                            <div className="space-y-3 cursor-pointer">
                                {telegramCommands.map((cmd, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                                        <code className="bg-white/20 font-semibold px-3 py-1.5 rounded-lg font-mono text-sm font-bold min-w-[100px]">
                                            {cmd.command}
                                        </code>
                                        <span className="text-blue-100 font-semibold">{cmd.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('expenses')}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${activeTab === 'expenses'
                                        ? 'bg-red-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    💸 Expenses
                                </button>
                                <button
                                    onClick={() => setActiveTab('income')}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${activeTab === 'income'
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    💰 Income
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                <h4 className="text-lg font-bold text-gray-800 mb-2">
                                    {activeTab === 'expenses' ? '📝 Just type naturally:' : '💚 Track your income:'}
                                </h4>
                                <p className="text-sm text-gray-500 font-semibold mb-4">
                                    🤖 AI automatically detects category from your natural language
                                </p>
                                <div className="space-y-3">
                                    {(activeTab === 'expenses' ? expenseExamples : incomeExamples).map((ex, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-xl">💬</span>
                                                </div>
                                                <code className="text-gray-800 font-semibold">"{ex.text}"</code>
                                            </div>
                                            <span className={`${ex.color} text-white px-3 py-1.5 rounded-lg text-sm font-bold`}>
                                                {ex.category}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-4 text-sm text-gray-500 font-semibold text-center">
                                    ✨ AI auto-detects the category from your message
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="dashboard" className="py-12 md:py-20 bg-gradient-to-b from-[#387ED1] to-[#2563eb]">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center mb-8 md:mb-16">
                        <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold mb-4">
                            <span>📊</span> Dashboard Preview
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">
                            Powerful <span className="text-blue-200">Insights</span> at a Glance
                        </h2>
                        <p className="text-base md:text-xl font-semibold text-blue-100 max-w-2xl mx-auto px-2">
                            Beautiful analytics to understand your spending patterns
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
                        {dashboardFeatures.map((feature, idx) => (
                            <div key={idx} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl">
                                <div className="text-2xl md:text-4xl mb-2 md:mb-4">{feature.icon}</div>
                                <h3 className="text-sm md:text-xl font-bold text-gray-800 mb-1 md:mb-2">{feature.title}</h3>
                                <p className="text-gray-600 font-semibold text-xs md:text-base">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl">
                        <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
                            🏷️ Smart Category Detection
                        </h3>
                        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
                            {categories.map((cat, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-xl md:rounded-2xl p-2 md:p-4 text-center hover:bg-gray-100 transition-all group border border-gray-100">
                                    <div className={`w-10 h-10 md:w-14 md:h-14 ${cat.color} rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-lg`}>
                                        <span className="text-lg md:text-2xl">{cat.icon}</span>
                                    </div>
                                    <h4 className="text-gray-800 font-bold text-xs md:text-sm mb-0.5 md:mb-1">{cat.name}</h4>
                                    <p className="text-gray-500 text-[10px] md:text-xs font-bold truncate">{cat.keywords}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="py-12 md:py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center mb-8 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-800 mb-3 md:mb-4">
                            How It Works
                        </h2>
                        <p className="text-base md:text-xl font-semibold text-gray-600 max-w-2xl mx-auto px-2">
                            Get started in minutes with our simple 4-step process
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#387ED1] to-[#2563eb]"></div>
                        <div className="space-y-6 md:space-y-12">
                            {steps.map((step, index) => (
                                <div key={index} className="relative flex items-start md:items-center">
                                    <div className="md:hidden flex items-start w-full">
                                        <div className="relative z-10 flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#387ED1] to-[#2563eb] rounded-full flex items-center justify-center shadow-xl">
                                                <span className="text-white text-base font-bold">{step.number}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 ml-4">
                                            <div className="bg-white rounded-xl p-4 shadow-lg">
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
                                                <p className="text-gray-600 text-sm font-semibold leading-relaxed">{step.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="hidden md:flex md:items-center md:w-full">
                                        <div className="flex-1 pr-12 text-right">
                                            {index % 2 === 0 && (
                                                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 inline-block text-left max-w-md ml-auto">
                                                    <h3 className="text-3xl font-bold text-gray-800 mb-3">{step.title}</h3>
                                                    <p className="text-gray-600 text-lg font-semibold leading-relaxed">{step.description}</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="relative z-10 flex-shrink-0">
                                            <div className="w-20 h-20 bg-gradient-to-br from-[#387ED1] to-[#2563eb] rounded-full flex items-center justify-center shadow-xl">
                                                <span className="text-white text-2xl font-bold">{step.number}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 pl-12 text-left">
                                            {index % 2 !== 0 && (
                                                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 inline-block max-w-md">
                                                    <h3 className="text-3xl font-bold text-gray-800 mb-3">{step.title}</h3>
                                                    <p className="text-gray-600 text-lg font-semibold leading-relaxed">{step.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="khata" className="py-12 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold mb-4">
                                <span>📒</span> Khata Book
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
                                Track Lending & <span className="text-purple-600">Borrowing</span>
                            </h2>
                            <p className="text-base md:text-xl font-semibold text-gray-600 mb-6 md:mb-8">
                                Never forget who owes you money or whom you owe. Keep clean records with friends and family.
                            </p>
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center gap-4 bg-green-50 rounded-xl p-4 border border-green-200">
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl">💚</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-green-800">To Receive</h4>
                                        <p className="text-green-600 text-sm font-semibold">Track money others owe you</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-red-50 rounded-xl p-4 border border-red-200">
                                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl">❤️</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-800">To Give</h4>
                                        <p className="text-red-600 text-sm font-semibold">Track money you owe others</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Example Party Entries</h3>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center border border-gray-100 hover:shadow-md transition-all ">
                                        <div className="flex items-center gap-3 cursor-pointer">
                                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">R</div>
                                            <div>
                                                <p className="text-gray-800 font-bold">Rahul</p>
                                                <p className="text-gray-500 text-xs font-semibold">3 transactions</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-green-600 font-bold">+₹5,000</p>
                                            <p className="text-gray-500 text-xs font-semibold">Will Receive</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center border border-gray-100 hover:shadow-md transition-all ">
                                        <div className="flex items-center gap-3 cursor-pointer">
                                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">A</div>
                                            <div>
                                                <p className="text-gray-800 font-bold">Amit</p>
                                                <p className="text-gray-500 text-xs font-semibold">2 transactions</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-red-600 font-bold">-₹2,000</p>
                                            <p className="text-gray-500 text-xs font-semibold">Will Give</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center border border-gray-100 hover:shadow-md transition-all ">
                                        <div className="flex items-center gap-3 cursor-pointer">
                                            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">P</div>
                                            <div>
                                                <p className="text-gray-800 font-bold">Priya</p>
                                                <p className="text-gray-500 text-xs font-semibold">1 transaction</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-600 font-bold">₹0</p>
                                            <p className="text-gray-500 text-xs font-semibold">Settled</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="cta" className="py-20 bg-gradient-to-br from-[#387ED1] to-[#2563eb]">
                <div className="max-w-4xl mx-auto px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Take Control?
                    </h2>
                    <p className="text-xl font-semibold text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of users who are already managing their finances smarter with SmartKhata.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => openAuthModal('register')}
                            className="px-8 py-4 bg-white text-[#387ED1] rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-lg cursor-pointer"
                        >
                            🚀 Get Started Free
                        </button>
                        <a
                            href="https://t.me/smart_khata_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-[#0088cc] text-white rounded-xl font-bold text-lg hover:bg-[#0077b3] transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <span>📱</span> Try Telegram Bot
                        </a>
                    </div>
                    <p className="text-sm font-semibold text-blue-200 mt-6">
                        ✅ No credit card required • ✅ Free forever • ✅ 2 minute setup
                    </p>
                </div>
            </section>

            <footer className="bg-gray-900 text-white py-8 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        <div className="col-span-2 md:col-span-1 mb-4 md:mb-0">
                            <div className="flex items-center space-x-2 mb-2 md:mb-4">
                                <div className="bg-[#387ED1] p-1.5 md:p-2 rounded-lg md:rounded-xl">
                                    <svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <span className="text-xl md:text-2xl font-extrabold text-white">
                                    Smart<span className="text-[#387ED1]">Khata</span>
                                </span>
                            </div>
                            <p className="text-gray-400 font-semibold text-sm md:text-base">
                                Your smart companion for financial freedom.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm md:text-lg mb-2 md:mb-4">Features</h4>
                            <ul className="space-y-1 md:space-y-2 text-gray-400 text-sm md:text-base">
                                <li><button onClick={() => scrollToSection('telegram')} className="hover:text-white cursor-pointer transition font-semibold">Telegram Bot</button></li>
                                <li><button onClick={() => scrollToSection('dashboard')} className="hover:text-white cursor-pointer transition font-semibold">Dashboard</button></li>
                                <li><button onClick={() => scrollToSection('khata')} className="hover:text-white cursor-pointer transition font-semibold">Khata Book</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm md:text-lg mb-2 md:mb-4">Quick Links</h4>
                            <ul className="space-y-1 md:space-y-2 text-gray-400 text-sm md:text-base">
                                <li><button onClick={() => scrollToSection('features')} className="hover:text-white cursor-pointer transition font-semibold">Features</button></li>
                                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white cursor-pointer transition font-semibold">How It Works</button></li>
                            </ul>
                        </div>
                        <div className="col-span-2 md:col-span-1 mt-2 md:mt-0">
                            <h4 className="font-bold text-sm md:text-lg mb-2 md:mb-4">Get Started</h4>
                            <button
                                onClick={() => openAuthModal('register')}
                                className="w-full py-2 md:py-3 bg-[#387ED1] text-white rounded-lg font-semibold text-sm md:text-base transition cursor-pointer"
                            >
                                Sign Up Now
                            </button>
                        </div>
                    </div>
                    <div className="border-t font-semibold border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2026 SmartKhata. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    initialView={authView}
                />
            )}
        </>
    );
}

export default LandingPage;