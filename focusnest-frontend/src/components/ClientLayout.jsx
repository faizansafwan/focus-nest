"use client";
import React, { useState } from "react";
import Header from "./Header";
import LeftSideNav from "./LeftSideNav";

export default function ClientLayout({ children }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onMenuClick={() => setNavOpen((prev) => !prev)} />
      <div className="flex flex-1">
        <LeftSideNav open={navOpen} />
        <main className={`transition-all duration-300 ease-in-out w-full ${navOpen ? "ml-64" : "ml-0"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
