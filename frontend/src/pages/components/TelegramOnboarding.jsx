import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send,
    MessageSquare,
    ArrowRight,
    Sparkles,
    Zap,
    Shield,
    Clock,
    Smartphone,
    Bell,
    BarChart3,
    MoreHorizontal
} from 'lucide-react';

const TelegramOnboarding = ({ userName }) => {
    const navigate = useNavigate();

    return (
        <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-4 overflow-auto">
            <div className="max-w-4xl mx-auto h-[90%] mt-12 flex flex-col">
                <div className="mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Welcome, <span className="text-[#387ED1]">{userName}</span>! 👋
                    </h1>
                    <p className="text-gray-500 mt-1 font-semibold text-bold text-sm">
                        Let's set up your expense tracking in just one step
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex-1 flex flex-col">
                    <div className="bg-gradient-to-r from-[#387ED1] to-[#5b9be5] px-6 py-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Send size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Connect Telegram Bot</h2>
                                <p className="text-blue-100 font-semibold text-sm">Track expenses effortlessly via chat</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex">
                        <div className="grid md:grid-cols-2 gap-6 w-full">
                            <div className="space-y-3">
                                <h3 className="text-base font-bold text-gray-800">
                                    Why connect Telegram?
                                </h3>

                                <FeatureItem
                                    icon={<Zap size={16} />}
                                    color="green"
                                    title="Instant Logging"
                                    description="Just type 'spent 500 on food' - done!"
                                />

                                <FeatureItem
                                    icon={<Sparkles size={16} />}
                                    color="blue"
                                    title="AI-Powered"
                                    description="Auto-categorizes your expenses smartly"
                                />

                                <FeatureItem
                                    icon={<MessageSquare size={16} />}
                                    color="purple"
                                    title="Smart Parsing"
                                    description="Understands natural language input"
                                />

                                <FeatureItem
                                    icon={<Clock size={16} />}
                                    color="orange"
                                    title="24/7 Available"
                                    description="Log expenses anytime, anywhere"
                                />
                            </div>

                            <div className="flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                                <div className="bg-[#387ED1] p-5 rounded-full mb-4 shadow-lg shadow-blue-200">
                                    <Send size={36} className="text-white" />
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                    Ready to get started?
                                </h3>
                                <p className="text-gray-500 font-semibold mb-4 text-bold text-sm">
                                    Connect your Telegram account in 2 minutes
                                </p>

                                <button
                                    onClick={() => navigate('/settings')}
                                    className="w-full max-w-xs bg-[#387ED1] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 cursor-pointer"
                                >
                                    Connect Telegram Now
                                    <ArrowRight size={18} />
                                </button>

                                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                                    <Shield className='font-semibold' size={14} />
                                    <span className='font-semibold text-sm'>Secure & Private</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 bg-[#387ED1] rounded-full animate-pulse"></div>
                        <h3 className="text-sm font-bold text-gray-700">Coming Soon</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 flex items-center gap-1.5">
                            <Bell size={12} /> Smart Reminders
                        </span>
                        <span className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 flex items-center gap-1.5">
                            <BarChart3 size={12} /> Advanced Reports
                        </span>
                        <span className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 flex items-center gap-1.5">
                            <MoreHorizontal size={12} /> More Features 
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, color, title, description }) => {
    const colorClasses = {
        green: 'bg-green-50 border-green-100',
        blue: 'bg-blue-50 border-blue-100',
        purple: 'bg-purple-50 border-purple-100',
        orange: 'bg-orange-50 border-orange-100'
    };

    const iconBgClasses = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500'
    };

    return (
        <div className={`flex items-center gap-3 p-3 ${colorClasses[color]} rounded-lg border`}>
            <div className={`${iconBgClasses[color]} p-2 rounded-lg text-white`}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-base">{title}</h4>
                <p className="text-xs font-semibold text-gray-600">{description}</p>
            </div>
        </div>
    );
};

export default TelegramOnboarding;
