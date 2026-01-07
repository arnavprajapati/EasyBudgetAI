import React from 'react';
import { Wallet, LogOut, Settings as SettingsIcon, LayoutDashboard, BookOpen } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';

function Navbar() {
    const { isAuth, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); 

    const handleLogout = () => {
        dispatch(logoutUser(navigate));
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white fixed top-0 w-full z-50 border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-3">
                <div className="flex items-center justify-between">
                    
                    <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
                        <Wallet className="w-8 h-8 text-[#387ED1]" />
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">SmartKhata</span>
                    </Link>

                    {isAuth && (
                        <div className="hidden md:flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
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
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-bold text-gray-600 hidden lg:inline bg-blue-50 px-3 py-1 rounded-full">
                                    Hi, {user?.name?.split(' ')[0] || 'User'}
                                </span>
                                
                                <Link
                                    to="/settings"
                                    className={`p-2 rounded-full transition-all ${
                                        isActive('/settings') ? 'bg-gray-100 text-[#387ED1]' : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    <SettingsIcon className="w-6 h-6" />
                                </Link>
                                
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-all flex items-center group"
                                    title="Logout"
                                >
                                    <LogOut className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-[#387ED1] font-bold transition duration-150"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-[#387ED1] hover:bg-[#2d66a8] text-white font-bold px-6 py-2 rounded-xl shadow-md transition-all duration-200"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;