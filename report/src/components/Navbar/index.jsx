import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const navItems = [
    {
      id: 1,
      title: "Report",
      path: "/report",
    },
    {
      id: 2,
      title: "Statistics",
      path: "/stats",
    },
    {
      id: 3,
      title: "About",
      path: "/about",
    },
    {
      id: 4,
      title: "Contacts",
      path: "/contacts",
    },
  ];
  return (
    <div className="w-full bg-slate-500 p-4 h-16">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/" className="font-bold">
            mokonyane
          </Link>
        </div>
        <div className="flex mr-4">
          <ul className="flex p-1 gap-2">
            {navItems.map((link) => (
              <li>
                <Link to={link.path}>{link.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
