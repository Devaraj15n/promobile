import React from "react";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function EmployeeTable({ employees, onEdit, onDelete }) {
  return (
    <table className="w-full border text-left">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 border">Employee Code</th>
          <th className="p-2 border">Name</th>
          <th className="p-2 border">Photo</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {employees.length === 0 ? (
          <tr>
            <td colSpan="4" className="text-center p-4 text-gray-500">
              No employees found
            </td>
          </tr>
        ) : (
          employees.map((emp) => (
            <tr key={emp.id}>
              <td className="p-2 border">{emp.employee_code}</td>
              <td className="p-2 border">{emp.user_name}</td>
              <td className="p-2 border">
                {emp.image ? (
                  <img
                    src={`${BACKEND_URL}${emp.image}`}
                    alt={emp.user_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 italic">No photo</span>
                )}
              </td>
              <td className="p-2 border">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                  onClick={() => onEdit(emp)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => onDelete(emp.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
