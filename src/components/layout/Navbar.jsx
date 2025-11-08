import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar({ onToggleSidebar }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle (Mobile Only) */}
          <button
            onClick={onToggleSidebar}
            className="text-2xl text-gray-700 hover:text-[#2F7E80] transition md:hidden"
          >
            ☰
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-semibold text-[#2F7E80]">
            Farm Vet Shop
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-[#2F7E80] transition">Home</Link>
          <Link to="/products" className="text-gray-700 hover:text-[#2F7E80] transition">Products</Link>
          <Link to="/about" className="text-gray-700 hover:text-[#2F7E80] transition">About</Link>
          <Link to="/contact" className="text-gray-700 hover:text-[#2F7E80] transition">Contact</Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center">
          <Link
            to="/login"
            className="rounded-xl border border-[#2F7E80] px-4 py-2 font-medium text-[#2F7E80] transition hover:bg-[#2F7E80] hover:text-white"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="block md:hidden text-gray-700"
        >
          {open ? <span className="text-2xl">✕</span> : <span className="text-2xl">☰</span>}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-sm animate-fade-in">
          <div className="flex flex-col space-y-4 p-4">
            <Link onClick={() => setOpen(false)} to="/" className="text-gray-700 hover:text-[#2F7E80]">Home</Link>
            <Link onClick={() => setOpen(false)} to="/products" className="text-gray-700 hover:text-[#2F7E80]">Products</Link>
            <Link onClick={() => setOpen(false)} to="/about" className="text-gray-700 hover:text-[#2F7E80]">About</Link>
            <Link onClick={() => setOpen(false)} to="/contact" className="text-gray-700 hover:text-[#2F7E80]">Contact</Link>

            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2 text-center font-medium text-white bg-gradient-to-r from-[#49BBBD] to-[#2F7E80] hover:opacity-90"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
