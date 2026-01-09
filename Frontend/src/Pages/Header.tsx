import React from "react";

type HeaderProps = {
  name: string;
  email: string;
};

const Header: React.FC<HeaderProps> = ({ name, email }) => {
  // Get initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="flex justify-end items-center gap-4 px-6 py-4 bg-white border-b">
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
