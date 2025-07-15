"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/" },
  { name: "Task", href: "/task" },
  { name: "Add Task", href: "/add-task" },
  { name: "Profile", href: "/profile" },
  { name: "Logout", href: "/logout" },
];

export default function LeftSideNav({ open }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 border-r border-gray-200 transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full"
      } mt-14`}
    >
      <div className="p-6">
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
