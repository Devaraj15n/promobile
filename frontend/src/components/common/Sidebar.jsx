import React from "react";
import SidebarFilters from "./SidebarFilters";

export default function Sidebar({ isOpen, onClose, ...props }) {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`
    fixed top-0 left-0 h-screen w-full bg-white transition-transform transform
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:relative md:w-64 md:translate-x-0 md:border-r
    overflow-y-auto
  `}
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <SidebarFilters {...props} />
      </div>


      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
