import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser(navigate));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome Back! 👋
                </h1>
                {user && (
                  <p className="text-gray-600">
                    Hello, <span className="font-semibold text-[#387ED1]">{user.name}</span>
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Logout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-br from-[#387ED1] to-[#2868b8] rounded-xl p-6 text-white shadow-lg">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="text-lg font-semibold mb-1">Dashboard</h3>
                <p className="text-sm text-blue-100">View your overview</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="text-lg font-semibold mb-1">Analytics</h3>
                <p className="text-sm text-purple-100">Track your progress</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="text-4xl mb-2">⚙️</div>
                <h3 className="text-lg font-semibold mb-1">Settings</h3>
                <p className="text-sm text-green-100">Manage your account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;