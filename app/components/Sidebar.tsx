// src/components/Sidebar.tsx
"use client";

import {
  Home, Tv, Newspaper, BarChart, Mic, Globe2, Activity, Cpu, Camera, Coffee, CheckSquare, PlaySquare, Video, Users, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";

type SidebarProps = {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  darkMode: boolean;
  collapsed?: boolean; // when true show icons-only
};

export default function Sidebar({ selectedCategory, onSelectCategory, darkMode, collapsed = false }: SidebarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdown = (category: string) => {
    setOpenDropdown(openDropdown === category ? null : category);
  };

  const menuItems = [
    { name: "Home", icon: Home },
    { name: "TV", icon: Tv, children: ["Live News", "Shows", "Podcasts"] },
    { name: "Magazine", icon: Newspaper, children: ["Daily Digest", "Weekly Wrap", "Editorial"] },
    { name: "Election Hub", icon: Users, children: ["Results", "Candidates", "Opinion Polls"] },
    { name: "Ground Report", icon: Mic },
    { name: "Life+Style", icon: Activity },
    { name: "India", icon: Globe2 },
    { name: "South", icon: Globe2 },
    { name: "Global", icon: Globe2, children: ["Asia", "Europe", "US", "Middle East"] },
    { name: "Business", icon: BarChart },
    { name: "All Sports", icon: Activity, children: ["Cricket", "Football", "Tennis", "Olympics"] },
    { name: "Technology", icon: Cpu },
    { name: "Showbuzz", icon: Camera, children: ["Movies", "TV Shows", "Celebrities"] },
    { name: "Newspresso", icon: Coffee },
    { name: "Specials", icon: Newspaper, children: ["Sunday Special", "Investigations"] },
    { name: "Videos", icon: Video },
    { name: "Short Videos", icon: PlaySquare },
    { name: "Fact Check", icon: CheckSquare },
  ];

  return (
    <div className={`h-full overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent transition-all duration-300 ease-in-out
        ${darkMode ? "bg-gray-900 text-gray-200 border-r border-gray-800" : "bg-orange-50 text-orange-900 border-r border-orange-200"}
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      <div className={`p-4 pt-20 ${collapsed ? "flex flex-col items-center" : ""}`}>
        <h2 className={`text-lg font-semibold mb-4 ${ collapsed ? "hidden" : ( darkMode ? "text-orange-400" : "text-orange-700" )}`}>
          Categories
        </h2>
        <ul className="space-y-2 w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = !!item.children;
            const isSelected = selectedCategory === item.name;

            return (
              <li key={item.name}>
                <div
                  onClick={() => hasChildren ? handleDropdown(item.name) : onSelectCategory(item.name)}
                  title={item.name} // helpful when collapsed (shows native tooltip)
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition w-full
                    ${isSelected ? "bg-orange-500 text-white" : (darkMode ? "hover:bg-gray-800 hover:text-orange-400" : "hover:bg-orange-100")}
                    ${collapsed ? "justify-center" : ""}`}
                >
                  <div className={`flex items-center space-x-3 ${collapsed ? "justify-center" : ""}`}>
                    <Icon size={20} className={`${isSelected ? "text-white" : darkMode ? "text-orange-400" : "text-orange-600"}`} />
                    {!collapsed && <span className="font-medium">{item.name}</span>}
                  </div>
                  {!collapsed && hasChildren && (openDropdown === item.name ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                </div>

                {/* Children */}
                {hasChildren && openDropdown === item.name && (
                  <ul className={`ml-8 mt-1 space-y-1 ${collapsed ? "hidden" : ""}`}>
                    {item.children?.map((child) => (
                      <li key={child} onClick={() => onSelectCategory(child)}
                        className={`p-2 rounded-md cursor-pointer text-sm transition ${ darkMode ? "hover:bg-gray-800 hover:text-orange-300" : "hover:bg-orange-100"}`}
                      >
                        {child}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

 