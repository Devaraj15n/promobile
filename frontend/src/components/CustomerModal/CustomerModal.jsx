import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function CustomerModal({ isOpen, onClose, onCustomerSaved, customer }) {
  const { user } = useContext(AuthContext);

  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loadingDeviceTypes, setLoadingDeviceTypes] = useState(true);

  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    device_type: "",
    warranty: "",
    model: "",
    repair_type: "",
    received_date: "",
    delivery_date: "",
    cost: "",
    invoice_number: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (customer) {
      setFormData({
        customer_name: customer.customer_name || "",
        phone_number: customer.phone_number || "",
        device_type: customer.device_type || "",
        warranty: customer.warranty || "",
        model: customer.model || "",
        repair_type: customer.repair_type || "",
        received_date: customer.received_date ? customer.received_date.split("T")[0] : "",
        delivery_date: customer.delivery_date ? customer.delivery_date.split("T")[0] : "",
        cost: customer.cost || "",
        invoice_number: customer.invoice_number || "",
      });
    } else {
      setFormData({
        customer_name: "",
        phone_number: "",
        device_type: "",
        warranty: "",
        model: "",
        repair_type: "",
        received_date: "",
        delivery_date: "",
        cost: "",
        invoice_number: "",
      });
    }
  }, [customer]);

  // Load device types
  useEffect(() => {
    async function fetchDeviceTypes() {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/device-types`);
        setDeviceTypes(res.data);
      } catch (error) {
        console.error("Error loading device types:", error);
      } finally {
        setLoadingDeviceTypes(false);
      }
    }
    fetchDeviceTypes();
  }, []);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.customer_name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!formData.device_type) {
      toast.error("Please select a device type");
      return;
    }

    try {
      const payload = { ...formData, modified_by: user.id, modified_date: new Date() };
      if (customer?.id) {
        await axios.put(`${BACKEND_URL}/api/customers/${customer.id}`, payload);
        toast.success("Customer updated successfully!");
      } else {
        await axios.post(`${BACKEND_URL}/api/customers`, {
          ...payload,
          created_by: user.id,
          created_date: new Date(),
          is_active: 1,
        });
        toast.success("Customer added successfully!");
      }
      if (onCustomerSaved) onCustomerSaved();
      onClose();
    } catch (error) {
      toast.error("Failed to save customer");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-2 md:p-0">
      <div className="bg-white rounded-lg shadow-lg w-full h-full md:h-auto max-w-[900px] md:mx-0 overflow-auto relative">
        
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-600 text-2xl font-bold md:hidden"
          onClick={onClose}
        >
          ×
        </button>

        <div className="p-6 h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-4">
            {customer ? "Edit Customer" : "Add Customer"}
          </h2>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-auto customer-form">
            <div className="flex flex-col">
              <label>Customer Name</label>
              <input
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label>Phone Number</label>
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label>Device Type</label>
              {loadingDeviceTypes ? (
                <p>Loading device types...</p>
              ) : (
                <select
                  name="device_type"
                  value={formData.device_type}
                  onChange={handleChange}
                  className="border p-2 rounded"
                >
                  <option value="">Select Device Type</option>
                  {deviceTypes.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-col">
              <label>Warranty</label>
              <select
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Select Warranty</option>
                <option value="1 month">1 month</option>
                <option value="6 month">6 month</option>
                <option value="1 year">1 year</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label>Model</label>
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label>Repair Type</label>
              <input
                name="repair_type"
                value={formData.repair_type}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label>Received Date</label>
              <input
                name="received_date"
                type="date"
                value={formData.received_date}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label>Delivery Date</label>
              <input
                name="delivery_date"
                type="date"
                value={formData.delivery_date}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label>Cost</label>
              <input
                name="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label>Invoice Number</label>
              <input
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-4 md:mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-lg"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              type="button"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
