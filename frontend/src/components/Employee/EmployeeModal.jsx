import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function EmployeeModal({ onClose, onSave, onDelete, initialData, nextCode }) {
  const [formData, setFormData] = useState({
    id: null,
    employee_code: "",
    user_name: "",
    password: "",
    photo: null, // actual file
    photoPreview: "", // preview URL
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || null,
        employee_code: initialData.employee_code || "",
        user_name: initialData.user_name || "",
        password: "",
        photo: null,
        photoPreview: initialData.image ? `${BACKEND_URL}${initialData.image}` : "",
      });
    } else {
      setFormData((prev) => ({ ...prev, employee_code: nextCode || "" })); // <-- use nextCode for new
    }
  }, [initialData, nextCode]);
  

  // Handle file upload & preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Edit Employee" : "Register Employee"}
        </h2>

        {/* Profile Photo Upload */}
        <div className="flex mb-4 items-center gap-4">
          <div className="w-20 h-20 overflow-hidden border bg-[#F8F8F8] rounded-[4px] flex items-center justify-center">
            {formData.photoPreview ? (
              <img
                src={formData.photoPreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser className="text-gray-400 text-3xl" />
            )}
          </div>
          <label className="cursor-pointer text-sm border px-3 py-1 rounded-[4px] hover:bg-gray-100">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Employee Code */}
        <label className="text-sm font-medium">Employee Code</label>
        <input
          value={formData.employee_code}
          readOnly
          className="border rounded p-2 w-full mb-3 bg-gray-100 cursor-not-allowed"
        />

        {/* Employee Name */}
        <label className="text-sm font-medium">Employee Name</label>
        <input
          value={formData.user_name}
          onChange={(e) =>
            setFormData({ ...formData, user_name: e.target.value })
          }
          className="border rounded p-2 w-full mb-3"
        />

        {/* Password */}
        <label className="text-sm font-medium">Password</label>
        <input
          type="password"
          placeholder={initialData ? "Leave blank to keep current" : "Enter password"}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="border rounded p-2 w-full mb-3"
        />

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          {initialData && (
            <button
              className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
              onClick={() => onDelete && onDelete(formData.id)} // ✅ use id
            >
              Delete
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              className="px-4 py-2 border rounded hover:bg-gray-100"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => onSave(formData)}
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
