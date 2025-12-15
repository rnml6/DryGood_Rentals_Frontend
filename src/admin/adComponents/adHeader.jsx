import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const getNavLinkClass = (isActive) =>
  isActive
    ? "bg-white text-[#1C3D5A] font-bold text-[0.85rem] tracking-wider p-2 px-4 rounded-lg shadow-lg transition-all duration-300"
    : "text-white text-[0.85rem] font-medium tracking-widest hover:scale-[1.02] hover:bg-white/10 p-2 px-4 rounded-lg transition-all duration-300";

function AdHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="w-full bg-[#1C3D5A] px-5.5 sm:px-8 lg:px-16 py-4 md:py-6 md:pt-8 flex items-center justify-between relative shadow-2xl">
      <div className="flex items-center z-20">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold tracking-wider text-white drop-shadow-md">
          ADMIN DASHBOARD
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <nav className="flex items-center gap-4">
          <NavLink
            to=""
            end
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            HOME
          </NavLink>

          <NavLink
            to="inventory"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            INVENTORY
          </NavLink>

          <NavLink
            to="record"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            RECORD
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center md:hidden z-20">
        <button onClick={toggleMenu} aria-label="Toggle navigation menu">
          {!isMenuOpen && <MenuIcon />}
        </button>
      </div>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[90] md:hidden"
            onClick={toggleMenu}
          />

          <div className="fixed top-0 right-0 w-64 h-screen bg-[#1C3D5A] z-[100] p-6 flex flex-col items-center pt-24 space-y-8 md:hidden shadow-xl">
            <div className="absolute top-4 right-4">
              <button onClick={toggleMenu} aria-label="Close navigation menu">
                <CloseIcon />
              </button>
            </div>

            <nav className="flex flex-col items-center space-y-6">
              <NavLink
                to=""
                end
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `${getNavLinkClass(isActive)} text-2xl p-4 w-48 text-center`
                }
              >
                HOME
              </NavLink>

              <NavLink
                to="inventory"
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `${getNavLinkClass(isActive)} text-2xl p-4 w-48 text-center`
                }
              >
                INVENTORY
              </NavLink>

              <NavLink
                to="record"
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `${getNavLinkClass(isActive)} text-2xl p-4 w-48 text-center`
                }
              >
                RECORD
              </NavLink>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

export default AdHeader;
