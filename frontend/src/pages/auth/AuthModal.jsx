import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { server } from '../../main';

function AuthModal({ onClose, initialView = 'login' }) {
    const [currentView, setCurrentView] = useState(initialView);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [btnLoading, setBtnLoading] = useState(false);
    const navigate = useNavigate();

    const isLogin = currentView === 'login';

    const toggleView = () => {
        setCurrentView(isLogin ? 'register' : 'login');
        setName('');
        setEmail('');
        setPassword('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBtnLoading(true);

        try {
            if (isLogin) {
                const { data } = await axios.post(`${server}/api/v1/login`, {
                    email,
                    password,
                });
                toast.success(data.message);
                localStorage.setItem('email', email);
                onClose();
                navigate('/verifyotp');
            } else {
                const { data } = await axios.post(`${server}/api/v1/register`, {
                    name,
                    email,
                    password,
                });
                localStorage.setItem('registeredEmail', email);
                onClose();
                navigate('/verify-email');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `${isLogin ? 'Login' : 'Registration'} failed`);
        } finally {
            setBtnLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-md p-4 transition-opacity duration-300">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-800">
                    <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    {isLogin ? "Log In" : "Register"}
                </h2>

                <form onSubmit={handleSubmit}>
                    
                    {!isLogin && (
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full font-semibold px-4 py-2 border rounded-lg focus:ring-[#387ED1] focus:border-[#387ED1]"
                                disabled={btnLoading}
                                required
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full font-semibold px-4 py-2 border rounded-lg focus:ring-[#387ED1] focus:border-[#387ED1]"
                            disabled={btnLoading}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full font-semibold px-4 py-2 border rounded-lg focus:ring-[#387ED1] focus:border-[#387ED1]"
                            disabled={btnLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={btnLoading}
                        className="w-full py-3 cursor-pointer bg-[#387ED1] text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
                    >
                        {btnLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <button
                        onClick={toggleView}
                        disabled={btnLoading}
                        className="text-gray-600 cursor-pointer hover:text-[#387ED1] font-semibold"
                    >
                        {isLogin ? "Don't have an account? Register here." : "Already have an account? Login here."}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;