import React, { useState } from 'react';
import AuthModal from './auth/AuthModal';

function LandingPage() {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authView, setAuthView] = useState('login');

    const openAuthModal = (view) => {
        setAuthView(view);
        setShowAuthModal(true);
    };

    return (
        <>
            <div className="h-screen relative overflow-hidden bg-white">
                <div className="flex flex-col items-center justify-center max-w-7xl mx-auto px-8 h-full relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between w-full pb-20 pt-10 md:pt-0">
                        <div className="flex-1 max-w-xl text-left">
                            <div className="flex items-start justify-between">
                                <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                                    Take Control <br />of <span className='text-[#387ED1]'>Your Money</span>
                                </h1>
                                <div className="w-32 h-32 z-10 md:hidden mt-4 ml-4 flex-shrink-0">
                                    <img
                                        src="https://res.cloudinary.com/dzz1wmydl/image/upload/v1762864750/unnamed_1_dick2v.jpg"
                                        alt="Small Visual"
                                        className="w-full h-full object-contain transform rotate-12"
                                    />
                                </div>
                            </div>

                            <p className="text-gray-600 font-bold text-xl mb-8">
                                Personal budgeting is the secret to financial freedom. Start your journey today.
                            </p>

                            <div className="flex space-x-4 max-w-sm">
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="flex-1 text-lg py-3 rounded-lg font-semibold text-white cursor-pointer bg-[#387ED1] hover:bg-blue-600 transition duration-200 shadow-lg"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => openAuthModal('register')}
                                    className="flex-1 text-lg py-3 rounded-lg font-semibold text-gray-800 cursor-pointer bg-gray-200 border border-gray-300 hover:bg-gray-300 transition duration-200 shadow-lg"
                                >
                                    Register
                                </button>
                            </div>
                        </div>

                        <div className="hidden md:flex md:flex-1 justify-center items-center mt-10 md:mt-0">
                            <img
                                src="https://res.cloudinary.com/dzz1wmydl/image/upload/v1762864750/unnamed_1_dick2v.jpg"
                                alt="Landing Visual"
                                className="w-full max-w-lg h-auto object-contain transform -rotate-3"
                            />
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-0 transform translate-y-1 pointer-events-none">
                    <svg viewBox="0 0 1440 420" className="w-full h-68 md:h-104" preserveAspectRatio="none">
                        <path fill={'#387ED1'} d="M0,250L48,266C96,282,192,314,288,314C384,314,480,282,576,276.7C672,271,768,293,864,298C960,303,1056,293,1152,282C1248,271,1344,261,1392,256.3L1440,250L1440,420L1392,420C1344,420,1248,420,1152,420C1056,420,960,420,864,420C768,420,672,420,576,420C480,420,384,420,288,420C192,420,96,420,48,420L0,420Z"></path>
                    </svg>
                </div>
            </div>

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