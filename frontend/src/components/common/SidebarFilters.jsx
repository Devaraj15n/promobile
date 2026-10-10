import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function SidebarFilters({ onSearch, onDateChange, onDeviceChange, onDeliveryStatusChange, onClear }) {
    const [masterDeviceTypes, setMasterDeviceTypes] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [deliveryStatus, setDeliveryStatus] = useState("all");

    useEffect(() => {
        async function fetchDeviceTypes() {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/device-types`);
                setMasterDeviceTypes(res.data);
            } catch (error) {
                console.error("Error loading device types:", error);
            }
        }
        fetchDeviceTypes();
    }, []);

    const handleSearchChange = (value) => {
        setSearchValue(value);
        onSearch(value);
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        if (start && end) {
            onDateChange({ from: start, to: end });
        } else {
            onDateChange({ from: null, to: null });
        }
    };

    const handleDeviceToggle = (device, checked) => {
        setSelectedDevices((prev) =>
            checked ? [...prev, device] : prev.filter((d) => d !== device)
        );
        onDeviceChange(device, checked);
    };

    const handleDeliveryStatusChange = (status) => {
        setDeliveryStatus(status);
        if (onDeliveryStatusChange) onDeliveryStatusChange(status);
    };

    const handleClear = () => {
        setSearchValue("");
        setStartDate(null);
        setEndDate(null);
        setSelectedDevices([]);
        setDeliveryStatus("all");
        onClear();
    };

    return (
        <div className="space-y-6 h-full flex flex-col sidebar-main-div" style={{ padding: "0px 10px 0px 0px" }}>
            {/* Search */}
            <div>
                <h3 className="mb-2">SEARCH</h3>
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full border rounded-lg p-2 text-sm"
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            {/* Clear button */}
            <div className="flex justify-between items-center">
                <h3 className="mb-2">FILTERS</h3>
                <button className="text-blue-600 text-xs underline" onClick={handleClear}>
                    Clear Data
                </button>
            </div>

            {/* Date */}
            <div>
                <h3 className="mb-2">DATE</h3>
                <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateChange}
                    isClearable={true}
                    className="w-full border rounded-lg p-2 text-sm"
                    dateFormat="dd/MM/yyyy"
                    // popperPlacement="right-start" 
                />
            </div>

            {/* Device Type */}
            <div>
                <h3 className="mb-2">DEVICE TYPE</h3>
                <div className="flex flex-col gap-1">
                    {masterDeviceTypes.map((item, index) => (
                        <label key={index} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedDevices.includes(item.name)}
                                onChange={(e) => handleDeviceToggle(item.name, e.target.checked)}
                            />
                            {item.name}
                        </label>
                    ))}
                </div>
            </div>

            {/* Delivery Status */}
            <div>
                <h3 className="mb-2">STATUS</h3>
                <div className="flex flex-col gap-1">
                    {[
                        { value: "all", label: "All" },
                        { value: "pending", label: "Not delivered" },
                        { value: "delivered", label: "Delivered" },
                    ].map((item) => (
                        <label key={item.value} className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={deliveryStatus === item.value}
                                onChange={() => handleDeliveryStatusChange(item.value)}
                            />
                            {item.label}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
