import React, { useState, useEffect, useContext } from 'react'
import EmployeeTable from '../components/Employee/EmployeeTable'
import EmployeeModal from '../components/Employee/EmployeeModal'
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'
import { RiDeleteBin5Fill } from "react-icons/ri";
import { AuthContext } from '../context/AuthContext';


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function EmployeeDetails() {
    const [modalOpen, setModalOpen] = useState(false)
    const [employees, setEmployees] = useState([])
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const navigate = useNavigate();
    const [deleteEmployeeId, setDeleteEmployeeId] = useState(null)
    const { user } = useContext(AuthContext);

    // ✅ Fetch employees
    useEffect(() => {
        fetch(`${BACKEND_URL}/api/users`)
            .then((res) => res.json())
            .then((data) => setEmployees(data))
            .catch((err) => {
                console.error('Error fetching employees', err)
                toast.error("Failed to load employees")
            })
    }, [])

    const handleSave = async (formData) => {
        try {
            const data = new FormData()
            data.append('user_name', formData.user_name)
            if (formData.password?.trim()) data.append('password', formData.password)
            if (formData.photo) data.append('image', formData.photo)

            let res
            if (selectedEmployee) {
                res = await fetch(`${BACKEND_URL}/api/users/${selectedEmployee.id}`, {
                    method: 'PUT',
                    body: data,
                })
            } else {
                res = await fetch(`${BACKEND_URL}/api/users`, {
                    method: 'POST',
                    body: data,
                })
            }

            if (!res.ok) throw new Error("Failed request")

            const saved = await res.json()

            if (selectedEmployee) {
                setEmployees((prev) =>
                    prev.map((emp) => (emp.id === saved.id ? saved : emp))
                )
                toast.success("Employee updated successfully")
            } else {
                setEmployees((prev) => [...prev, saved])
                toast.success("Employee added successfully")
            }

            setModalOpen(false)
            setSelectedEmployee(null)
        } catch (error) {
            console.error('Error saving employee', error)
            toast.error("Error saving employee")
        }
    }

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error("Delete failed")
            setEmployees((prev) => prev.filter((emp) => emp.id !== id));
            setModalOpen(false);
            toast.success("Employee deleted successfully")
        } catch (error) {
            setModalOpen(false);
            console.error('Error deleting employee', error)
            toast.error("Error deleting employee")
        } finally {
            setDeleteEmployeeId(null); // ✅ close modal after action
        }
    }

    return (
        <>
            <div className="sticky">
                <div className="flex items-center justify-between bg-white p-4 shadow-sm">
                    <h1 className="text-xl font-bold text-blue-900">PROMOBILE</h1>
                    <div className="flex justify-center items-center gap-2" style={{ cursor: 'pointer' }}>
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
                </div>
            </div>

            <div className="p-4 flex items-center gap-3">
                <button
                    onClick={() => navigate('/dashboard')}   // redirects to home page
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                    Home
                </button>
                <button
                    onClick={() => {
                        setSelectedEmployee(null)
                        setModalOpen(true)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    + Add Employee
                </button>
            </div>

            <div>
                <EmployeeTable
                    employees={employees}
                    onEdit={(emp) => {
                        setSelectedEmployee(emp)
                        setModalOpen(true)   // <-- open modal here
                    }}
                    onDelete={(id) => setDeleteEmployeeId(id)}
                />
            </div>



            {modalOpen && (
                <EmployeeModal
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    initialData={selectedEmployee}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteEmployeeId && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
                                <RiDeleteBin5Fill className="text-[#FF361B] text-2xl" />
                            </div>
                            <h2 className="text-lg font-bold mb-2">Delete Employee</h2>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this employee?
                            </p>

                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => handleDelete(deleteEmployeeId)}
                                    className="flex-1 bg-[#FF361B] text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setDeleteEmployeeId(null)}
                                    className="flex-1 border border-gray-400 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default EmployeeDetails
