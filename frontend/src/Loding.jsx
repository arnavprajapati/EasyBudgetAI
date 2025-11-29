import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-[#387ED1] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-6 text-[#387ED1] font-semibold text-lg animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loading;