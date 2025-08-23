import React from "react";
import AppRoute from "./routes/AppRoutes";
import './index.css';
import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <AppRoute />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
