import React, { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeContext } from "../Components/ThemeContext";

type HeaderProps = {
  name: string;
  email: string;
};

const Header: React.FC<HeaderProps> = ({ name, email }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Get initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="flex justify-between items-center gap-4 px-6 py-4 bg-white border-b">
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Admin info */}
      <div className="text-right">
        <div className="font-semibold text-gray-800">{name}</div>
        <div className="text-sm text-gray-500">{email}</div>
      </div>

      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
        {initials}
      </div>
    </header>
  );
};

export default Header;
