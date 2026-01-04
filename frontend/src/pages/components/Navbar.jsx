import React from 'react';
import { Wallet, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';

function Navbar() {
    const { isAuth, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser(navigate));
    };

    return (
        <nav className="bg-white fixed top-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2">
                        <Wallet className="w-8 h-8 text-[#387ED1]" />
                        <span className="text-2xl font-bold text-gray-900">SmartKhata</span>
                    </Link>

                    {isAuth ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold text-gray-700 hidden sm:inline">
                                Hello, {user?.name || 'User'}!
                            </span>
                            <Link
                                to="/settings"
                                className="p-2 rounded-full cursor-pointer text-gray-600 hover:bg-gray-100 transition duration-150"
                            >
                                <SettingsIcon className="w-6 h-6" />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-full cursor-pointer text-red-500 hover:bg-red-50 transition duration-150 flex items-center gap-1 font-semibold"
                            >
                                <LogOut className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-[#387ED1] font-semibold transition duration-150"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-gradient-to-r from-[#387ED1] to-[#2868b8] hover:from-[#2868b8] hover:to-[#1d5299] text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;