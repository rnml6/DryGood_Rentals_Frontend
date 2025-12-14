import React from "react";
import { Link } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20">
          <h1 className="text-[5rem] sm:text-[7rem] font-extrabold text-[#1C3D5A] drop-shadow-lg">
            404
          </h1>

          <p className="text-xl sm:text-2xl text-gray-700 mt-4 tracking-wide">
            Page Not Found
          </p>

          <p className="text-gray-500 mt-2 max-w-md">
            You do not have permission to access this page.
          </p>

          <Link
            to="/"
            className="mt-8 bg-[#1C3D5A] text-white px-6 py-3 rounded-lg tracking-wider shadow-lg hover:scale-105 hover:bg-[#244b6e] transition-all"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
