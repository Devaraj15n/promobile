import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "../components/common/Login";
import Dashboard from "../pages/Dashboard";
import EmployeeDetails from "../pages/EmployeeDetails";


const AppRoute = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />}></Route>
                <Route path="/dashboard" element={<Dashboard />}></Route>
                <Route path="/employee" element={<EmployeeDetails />}></Route>
            </Routes>
        </Router>
    )
};

export default AppRoute;