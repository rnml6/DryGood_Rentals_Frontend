import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function LoginButton() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 1000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div>
      <button
        onClick={handleOpenLogin}
        className="bg-[#1C3D5A] text-white px-4 py-2 rounded-lg font-medium tracking-widest hover:bg-[#1C3D5A]/90 transition-colors duration-200 opacity-0"
      >
        Login ({clickCount}/10)
      </button>

      {showLogin && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
            <h2 className="text-2xl font-extrabold font-serif tracking-wide uppercase text-center mb-6 text-[#1C3D5A]">
              Admin Access
            </h2>

            <input
              type="email"
              placeholder="Email"
              className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] text-[#1C3D5A]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="border border-gray-300 p-3 w-full mb-6 rounded-lg focus:outline-none focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] text-[#1C3D5A]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-between mt-1 gap-4">
              <button
                onClick={() => setShowLogin(false)}
                className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg w-full font-medium hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>

              <button
                onClick={handleLogin}
                className="bg-[#1C3D5A] text-white px-5 py-2 rounded-lg  w-full font-medium tracking-wide hover:bg-[#1C3D5A]/90 transition-colors duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginButton;
