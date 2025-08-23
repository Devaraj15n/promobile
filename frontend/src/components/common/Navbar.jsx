import React, { useContext, useState } from "react";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import SidebarFilters from "./SidebarFilters";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Navbar(props) {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async() => {
        await logout();
        navigate("/");
    };

    return (
        <div className="bg-gray-200 shadow-md">
            {/* Top bar: Logo + Profile */}
            <div className="flex items-center justify-between bg-white p-4 shadow-sm">
                <h1 className="text-xl font-bold text-blue-900">PROMOBILE</h1>

                <div className="flex items-center gap-3">
                    {/* Mobile filter toggle */}
                    <button
                        className="md:hidden px-3 py-2 bg-gray-300 rounded"
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    >
                        {isFiltersOpen ? "Close Filters" : "Filters"}
                    </button>


                    <div className="flex justify-center items-center gap-2">
                        {/* Profile Image Click → Open Modal */}
                        <div onClick={() => setIsLogoutModalOpen(true)} className="flex justify-center items-center gap-2" style={{ cursor: 'pointer' }}>
                            <img
                                src={
                                    user && user.image
                                        ? `${BACKEND_URL}${user.image}`
                                        : `${BACKEND_URL}/uploads/default-avatar.jpg`
                                }
                                alt="Profile"
                                className="w-10 h-10 rounded-full cursor-pointer"

                            />
                            <strong>{user?.user_name}</strong>
                        </div>


                        {/* Logout Modal */}
                        {isLogoutModalOpen && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                                    <h2 className="text-lg font-bold mb-4 text-center">
                                        Confirm Logout
                                    </h2>
                                    <p className="text-sm text-gray-600 mb-6 text-center">
                                        Are you sure you want to log out?
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => setIsLogoutModalOpen(false)}
                                            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info + Action Buttons */}
            <div className="flex flex-col md:flex-row justify-between p-4 md:p-6 bg-gray-50 gap-4 md:gap-0">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold">Customer records</h2>
                    <p className="text-sm text-gray-500">
                        List of customers with device details, service status, and repair history
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                    {user && user.user_type === 1 ? (
                        <>
                            <button
                                onClick={props.onExport}
                                className="px-4 sm:px-6 py-2 sm:py-3 border rounded-lg text-sm flex gap-2 items-center font-semibold bg-white"
                            >
                                <IoCloudDownloadOutline /> Export
                            </button>

                            <button
                                onClick={props.onAddCustomer}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold"
                            >
                                + Add Customer
                            </button>

                            <button
                                onClick={props.onEmployeeClick}
                                className="px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 bg-green-600 text-white rounded-lg text-sm font-semibold"
                            >
                                <FaEye /> Employee Details
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={props.onAddCustomer}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold"
                            >
                                + Add Customer
                            </button>
                        </>
                    )}





                </div>
            </div>

            {/* Mobile Filters Panel */}
            {isFiltersOpen && (
                <div
                    className={`
      md:hidden absolute top-0 left-0 h-screen w-[80%] bg-white p-4 z-40 overflow-y-auto
      transition-transform transform
    `}
                >
                    {/* Close button with X */}
                    <div className="flex justify-end mb-4">
                        <button
                            className="text-gray-600 text-xl font-bold px-2 py-1 rounded hover:bg-gray-200"
                            onClick={() => setIsFiltersOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    {/* Sidebar filters content */}
                    <SidebarFilters {...props} />
                </div>
            )}


        </div>
    );
}
