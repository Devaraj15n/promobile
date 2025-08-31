import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Sidebar from "../components/common/Sidebar";
import CustomerCard from "../components/common/CustomerCard";
import Navbar from "../components/common/Navbar";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CustomerModal from '../components/CustomerModal/CustomerModal'
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { AuthContext } from "../context/AuthContext";


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
console.log(BACKEND_URL);
const socket = io(BACKEND_URL, {
    transports: ["websocket"],
});


export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [loginRequest, setLoginRequest] = useState(null); // Stores current request
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const today = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState({ from: today, to: today });
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [deleteCustomerId, setDeleteCustomerId] = useState(null);


    const handleExport = () => {
        if (!filteredCustomers.length) {
            toast.info("No customer data to export");
            return;
        }


        // 1. Map data to neat order and readable headers
        const exportData = filteredCustomers.map((c, index) => ({
            "S.No": index + 1,
            "Customer Name": c.customer_name,
            "Phone Number": c.phone_number,
            "Device Type": c.device_type,
            "Model": c.model,
            "Warranty": c.warranty,
            "Repair Type": c.repair_type,
            "Cost (KD)": c.cost,
            "Advance (KD)": c.advance,
            "Invoice Number": c.invoice_number,
            "Received Date": new Date(c.received_date).toLocaleDateString(),
            "Delivery Date": new Date(c.delivery_date).toLocaleDateString(),
            "Created By": c.createdUser?.user_name || "N/A",
            "Employee Code": c.createdUser?.employee_code || "N/A",
            "Created Date": new Date(c.created_date).toLocaleString("en-US", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            })
        }));

        // 2. Convert to worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // 3. Set column widths for neat spacing
        const columnWidths = [
            { wch: 5 },   // S.No
            { wch: 20 },  // Customer Name
            { wch: 15 },  // Phone Number
            { wch: 15 },  // Device Type
            { wch: 15 },  // Model
            { wch: 10 },  // Warranty
            { wch: 15 },  // Repair Type
            { wch: 12 },  // Cost (KD)
            { wch: 12 },  // Advance (KD)
            { wch: 15 },  // Invoice Number
            { wch: 15 },  // Received Date
            { wch: 15 },  // Delivery Date
            { wch: 20 },  // Created By
            { wch: 12 },  // Employee Code
            { wch: 25 }   // Created Date
        ];
        worksheet["!cols"] = columnWidths;

        // 4. Bold header row
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: 0 };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!worksheet[cell_ref]) continue;
            worksheet[cell_ref].s = {
                font: { bold: true }
            };
        }

        // 5. Create workbook and append sheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

        // 6. Write workbook to binary
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

        // 7. Save as file
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "customers.xlsx");

        toast.success("Customer data exported successfully!");
    };



    // Reset filters
    const handleClearFilters = () => {
        setSearch("");
        setSelectedDate({ from: null, to: null });
        setSelectedDevices([]);
    };

    // Handle device filter toggle
    const handleDeviceChange = (device, checked) => {
        setSelectedDevices((prev) =>
            checked ? [...prev, device] : prev.filter((d) => d !== device)
        );
    };

    const filteredCustomers = customers.filter((c) => {
        const start = new Date(selectedDate.from);
        const end = new Date(selectedDate.to);
        end.setHours(23, 59, 59, 999);

        const matchSearch =
            c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone_number.includes(search);

        const matchDate =
            selectedDate.from && selectedDate.to
                ? new Date(c.received_date) >= start && new Date(c.received_date) <= end
                : true;

        const matchDevice =
            selectedDevices.length > 0 ? selectedDevices.includes(c.deviceType.name) : true;

        return matchSearch && matchDate && matchDevice;
    });


    const handleInfoCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsInfoModalOpen(true);
    };

    const handleDeleteCustomer = async (id) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/customers/${id}`);
            toast.success("Customer deleted successfully");
            fetchCustomers();
        } catch (err) {
            console.error("Failed to delete:", err);
            toast.error("Delete failed");
        } finally {
            setDeleteCustomerId(null); // close modal after delete
        }
    };


    const handleAddCustomer = () => {
        setEditingCustomer(null); // clear previous edit
        setIsCustomerModalOpen(true);
    };

    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setIsCustomerModalOpen(true);
    };



    const handleApproval = (approved) => {
        if (!loginRequest) return;

        socket.emit("approve_login", {
            loginId: loginRequest.loginId,
            approved,
            superAdminId: currentAdminId
        }, (response) => {
            if (response.success) {
                console.log("Approval processed successfully");
            } else {
                console.error("Approval failed:", response.error);
            }
        });

        // Close modal
        setLoginRequest(null);
    };

    const userType = user?.user_type;
    const currentAdminId = userType === 1 ? user?.id : null;

    // Redirect if no user
    useEffect(() => {
        if (!user) navigate("/");
    }, [user, navigate]);

    // Fetch customers
    // useEffect(() => {
    const fetchCustomers = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/customers`);
            setCustomers(res.data);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        } finally {
            setLoading(false);
        }
    };
    // fetchCustomers();
    // }, []);
    useEffect(() => {
        fetchCustomers();
    }, []);

    // Forced logout listener
    useEffect(() => {
        const handleForcedLogout = () => {
            toast.warning("You've been logged out from another device");
            localStorage.clear();
            navigate("/");
        };
        socket.on("forced_logout", handleForcedLogout);
        return () => socket.off("forced_logout", handleForcedLogout);
    }, [navigate]);

    // Register current user socket for approvals and responses
    useEffect(() => {
        if (user?.id) {
            socket.emit("register", user.id);

            // Listen for approval responses if pending login
            const handleLoginResponse = ({ approved, token, user: approvedUser }) => {
                if (approved) {
                    localStorage.setItem("token", token);
                    localStorage.setItem("current_user_id", approvedUser.id);
                    toast.success("Login approved!");
                    navigate("/dashboard");
                } else {
                    toast.error("Login rejected by super admin");
                }
            };

            socket.on("login_response", handleLoginResponse);
            return () => socket.off("login_response", handleLoginResponse);
        }
    }, [user, navigate]);

    // Super admin: handle login requests
    useEffect(() => {
        if (currentAdminId) {
            const handleLoginRequest = (request) => {
                // Save request to state to show modal
                setLoginRequest(request);
            };

            socket.on("login_request", handleLoginRequest);
            return () => socket.off("login_request", handleLoginRequest);
        }
    }, [currentAdminId]);


    if (loading) return <p>Loading customers...</p>;

    return (
        // <div className="min-h-screen lg:h-screen lg:overflow-hidden">
        <div className="flex flex-col h-screen">

            {loginRequest && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <h2 className="text-lg font-bold mb-4">Login Approval</h2>
                        <div className="flex mb-4 flex-col ">
                            <div className="mb-4">
                                <img
                                    src={loginRequest.avatar
                                        ? `${BACKEND_URL}${loginRequest.avatar}`
                                        : `${BACKEND_URL}/uploads/default-avatar.jpg`}
                                    alt={loginRequest.user_name}
                                    className="w-12 h-12  mr-4" style={{ borderRadius: '4px' }}
                                />
                            </div>

                            <div>
                                <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <p className="text-[14px]">Employee Code</p>
                                    <p className="text-[#0897FF] font-bold">{loginRequest.code || "N/A"}</p>
                                </div>
                                <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <p className="text-[14px]">Employee Name</p>
                                    <p className="text-[#0897FF] font-bold">{loginRequest.user_name}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded"
                                onClick={() => handleApproval(false)}
                            >
                                Decline
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={() => handleApproval(true)}
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Navbar
                onAddCustomer={handleAddCustomer}
                onEmployeeClick={() => navigate('/employee')}
                onExport={handleExport}
                onSearch={setSearch}
                onDateChange={setSelectedDate}
                onDeviceChange={handleDeviceChange}
                onClear={handleClearFilters}
            />

            <CustomerModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                onCustomerSaved={fetchCustomers}
                customer={editingCustomer}
            />
            {/* <div className="flex overflow-y-auto" style={{ height: "calc(100vh - 20vh)" }}> */}
            <div className="flex flex-1 overflow-hidden p-4">
                <Sidebar
                    onSearch={setSearch}
                    onDateChange={setSelectedDate}
                    onDeviceChange={handleDeviceChange}
                    onClear={handleClearFilters}
                />
                <div className="overflow-scroll lg:overflow-auto w-full py-[20px] px-[20px]">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(c => (
                            <CustomerCard
                                key={c.id}
                                id={c.id}
                                name={c.customer_name}
                                phone={c.phone_number}
                                device={c.deviceType.name}
                                warranty={c.warranty}
                                model={c.model}
                                cost={`${c.cost}`}
                                advance={`${c.advance}`}
                                received={new Date(c.received_date).toLocaleDateString()}
                                delivery={new Date(c.delivery_date).toLocaleDateString()}
                                type={c.repair_type}
                                invoice={c.invoice_number}
                                onInfo={() => handleInfoCustomer(c)}
                                onEdit={() => handleEditCustomer(c)}
                                onDelete={() => setDeleteCustomerId(c.id)}
                            />
                        ))) : (
                        <div className="text-center text-gray-500 p-10 border rounded-lg bg-gray-100">
                            No data found
                        </div>
                    )}


                </div>
                {isInfoModalOpen && selectedCustomer && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white rounded-lg p-6 w-96">
                            <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-300">
                                <h2 className="text-lg font-bold">Info</h2>

                                <button
                                    onClick={() => setIsInfoModalOpen(false)}
                                    style={{
                                        background: "#F64C35",
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%", // fully circular
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: 0,
                                        lineHeight: 1,
                                        fontSize: "18px",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#fff",
                                        fontWeight: 700
                                    }}
                                >
                                    &times;
                                </button>


                            </div>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                <p className="font-semibold">Employee Code</p>
                                <p className="text-blue-600 font-bold text-end">{selectedCustomer.createdUser.employee_code}</p>

                                <p className="font-semibold">Employee Name</p>
                                <p className="text-blue-600 font-bold text-end">{selectedCustomer.createdUser.user_name}</p>

                                <p className="font-semibold">Date</p>
                                <p className="text-blue-600 font-bold text-end">
                                    {new Date(selectedCustomer.created_date).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        day: "2-digit",
                                        year: "numeric",
                                    })}
                                </p>

                                <p className="font-semibold">Time</p>
                                <p className="text-blue-600 font-bold text-end">
                                    {new Date(selectedCustomer.created_date).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {deleteCustomerId && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white rounded-lg p-6 w-96">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
                                    <RiDeleteBin5Fill className="text-[#FF361B] text-2xl" />
                                </div>
                                <h2 className="text-lg font-bold mb-2">Delete Customer</h2>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete this customer?
                                </p>

                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={() => handleDeleteCustomer(deleteCustomerId)}
                                        className="flex-1 bg-[#FF361B] text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setDeleteCustomerId(null)}
                                        className="flex-1 border border-gray-400 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



            </div>
        </div>


    );
}
