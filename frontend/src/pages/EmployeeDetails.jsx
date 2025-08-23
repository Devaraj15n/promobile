import React, { useState, useEffect } from 'react'
import EmployeeTable from '../components/Employee/EmployeeTable'
import EmployeeModal from '../components/Employee/EmployeeModal'
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function EmployeeDetails() {
    const [modalOpen, setModalOpen] = useState(false)
    const [employees, setEmployees] = useState([])
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const navigate = useNavigate();

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
        }
    }

    return (
        <>
            <div className="sticky">
                <div className="flex items-center justify-between bg-white p-4 shadow-sm">
                    <h1 className="text-xl font-bold text-blue-900">PROMOBILE</h1>
                    <div className="flex items-center gap-3">
                        <img
                            src="https://via.placeholder.com/40"
                            alt="Profile"
                            className="w-10 h-10 rounded-full"
                        />
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
                    onDelete={handleDelete}
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
        </>
    )
}

export default EmployeeDetails
