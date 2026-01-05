import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser(navigate));
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-32 bg-[#387ED1] flex items-center justify-center">
          <div className="bg-white p-3 rounded-full shadow-lg">
            <UserIcon size={40} className="text-[#387ED1]" />
          </div>
        </div>

        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back,
          </h1>
          <p className="text-3xl font-extrabold text-[#387ED1] mb-6">
            {user ? user.name : "Guest User"}
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#387ED1] text-white font-bold rounded-lg hover:bg-[#2d66a8] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
            >
              <LayoutDashboard size={20} />
              Go to Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors duration-200 cursor-pointer border border-red-100"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        <div className="bg-gray-50 py-4 px-8 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Account Security: Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;