import React from 'react';
import { Wallet, LogOut, Settings as SettingsIcon, LayoutDashboard, BookOpen, User, Home } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';

function Navbar({ onAuthClick }) {
    const { isAuth, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logoutUser(navigate));
    };

    const isActive = (path) => location.pathname === path;

    const isLandingPage = location.pathname === '/';
    if (isLandingPage && !isAuth) {
        return null;
    }

    return (
        <>
            <nav className="bg-white fixed top-0 w-full z-50 border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-3">
                    <div className="flex items-center justify-between">
                        
                        <Link title="Home" to="/" className="flex items-center space-x-2 flex-shrink-0">
                            <div className="bg-[#387ED1] p-1.5 rounded-lg">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                                Smart<span className="text-[#387ED1]">Khata</span>
                            </span>
                        </Link>

                        {isAuth && (
                            <div className="hidden md:flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                                <Link
                                    to="/"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                        isActive('/') 
                                        ? 'bg-white text-[#387ED1] shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Home size={18} />
                                    Home
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                        isActive('/dashboard') 
                                        ? 'bg-white text-[#387ED1] shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/party"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                        isActive('/party') 
                                        ? 'bg-white text-purple-600 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <BookOpen size={18} />
                                    Khata Book
                                </Link>
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            {isAuth ? (
                                <div className="flex items-center space-x-2 md:space-x-4">
                                    <Link
                                        to="/profile"
                                        className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-[#387ED1] hover:shadow-md transition-all"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-[#387ED1] to-[#5a9de8] rounded-full flex items-center justify-center shadow-sm">
                                            <User size={16} className="text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">
                                            {user?.name?.split(' ')[0] || 'User'}
                                        </span>
                                    </Link>
                                    
                                    <Link
                                        to="/settings"
                                        className={`p-2 rounded-xl transition-all ${
                                            isActive('/settings') ? 'bg-gray-100 text-[#387ED1]' : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                    >
                                        <SettingsIcon className="w-5 h-5 md:w-6 md:h-6" />
                                    </Link>
                                    
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all cursor-pointer group"
                                    >
                                        <LogOut className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    {onAuthClick ? (
                                        <>
                                            <button 
                                                onClick={() => onAuthClick('login')} 
                                                className="text-sm font-bold text-gray-600 hover:text-[#387ED1]"
                                            >
                                                Login
                                            </button>
                                            <button
                                                onClick={() => onAuthClick('register')}
                                                className="bg-[#387ED1] text-white text-sm font-bold px-5 py-2 rounded-xl shadow-md hover:shadow-blue-200 transition-all"
                                            >
                                                Sign Up
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-[#387ED1]">
                                                Login
                                            </Link>
                                            <Link
                                                to="/register"
                                                className="bg-[#387ED1] text-white text-sm font-bold px-5 py-2 rounded-xl shadow-md hover:shadow-blue-200 transition-all"
                                            >
                                                Sign Up
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {isAuth && (
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-2 flex justify-around items-center z-50 pb-safe">
                    <Link 
                        to="/" 
                        className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-[#387ED1]' : 'text-gray-400'}`}
                    >
                        <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Home</span>
                    </Link>

                    <div className="w-px h-8 bg-gray-100" />

                    <Link 
                        to="/dashboard" 
                        className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-[#387ED1]' : 'text-gray-400'}`}
                    >
                        <LayoutDashboard size={22} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Dashboard</span>
                    </Link>

                    <div className="w-px h-8 bg-gray-100" />

                    <Link 
                        to="/party" 
                        className={`flex flex-col items-center gap-1 ${isActive('/party') ? 'text-purple-600' : 'text-gray-400'}`}
                    >
                        <BookOpen size={22} strokeWidth={isActive('/party') ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Khata Book</span>
                    </Link>
                </div>
            )}
            
            <div className="h-16"></div>
        </>
    );
}

export default Navbar;