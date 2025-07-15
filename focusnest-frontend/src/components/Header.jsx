"use client";
import React from "react";

export default function Header({ onMenuClick }) {
  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 px-4 py-3 border-b border-gray-200 flex items-center gap-7">
      <button
        className="text-gray-600 hover:text-blue-600 focus:outline-none cursor-pointer"
        onClick={onMenuClick}
      >
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Focus Nest
      </h1>
    </header>
  );
}
