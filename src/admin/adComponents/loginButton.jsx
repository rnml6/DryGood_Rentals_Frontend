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
    </div>
  );
}

export default LoginButton;
