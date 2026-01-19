import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const email = localStorage.getItem('registeredEmail') || 'your email';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#387ED1] to-[#5a9be8] px-6 py-5 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Mail size={24} className="text-white" />
                    </div>
                    <h1 className="text-lg font-bold text-white">Check Your Email</h1>
                </div>

                <div className="p-5 text-center">
                    <p className="text-gray-500 font-semibold text-sm mb-1">Verification link sent to:</p>
                    <p className="text-[#387ED1] font-bold mb-4">{email}</p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-[#387ED1] text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
                                <p className="text-gray-600 font-semibold">Open email inbox</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-[#387ED1] text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
                                <p className="text-gray-600 font-semibold">Find SmartKhata email</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-[#387ED1] text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
                                <p className="text-gray-600 font-semibold">Click verification link</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-amber-600 font-semibold text-xs mb-4">
                        ⚠️ Link expires in 5 min. Check spam if not found.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-1 text-gray-400 hover:text-[#387ED1] font-semibold cursor-pointer transition-colors mx-auto text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
