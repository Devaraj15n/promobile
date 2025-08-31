import React, { useContext, useState, useEffect } from "react";
import loginImage from "../../assets/Login.jpg";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const socket = io(BACKEND_URL, {
  transports: ["websocket"],
});

function Login() {
  const { login } = useContext(AuthContext);
  const [employeeCode, setEmployeeCode] = useState("");  // ✅ changed
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  // Handle forced logout from other devices
  useEffect(() => {
    const handleForcedLogout = () => {
      toast.warning("You were logged out from another device");
      localStorage.clear();
      navigate("/");
    };

    socket.on("forced_logout", handleForcedLogout);
    return () => socket.off("forced_logout", handleForcedLogout);
  }, [navigate]);

  const handleLogin = async () => {
    if (!employeeCode.trim() || !password.trim()) {
      toast.error("Employee code and Password are required");
      return;
    }

    setIsLoggingIn(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        employee_code: employeeCode,   // ✅ send employee_code
        password,
      });

      // If user is already logged in, force logout previous sessions
      if (res.data.existingSession) {
        const confirmLogout = window.confirm(
          "You are already logged in on another device. Do you want to logout other sessions?"
        );
        if (!confirmLogout) {
          setIsLoggingIn(false);
          return;
        }

        await axios.post(`${BACKEND_URL}/api/auth/force-logout`, { 
          employee_code: employeeCode   // ✅ send employee_code
        });
        return handleLogin(); // Retry login after force logout
      }

      // Successful login
      if (res.data.token) {
        login(res.data.user, res.data.token);
        localStorage.setItem("current_user_id", res.data.user.id);
        toast.success("Login Successful");
        navigate("/dashboard");
        return;
      }

      // Awaiting super admin approval
      if (res.data.message === "Awaiting super admin approval") {
        toast.info("Waiting for super admin approval...");
        localStorage.setItem("pending_user_id", res.data.user_id);

        socket.emit("register", res.data.user_id);

        const approvalHandler = ({ approved, token, user }) => {
          if (approved) {
            toast.success("Login approved!");
            login(user, token);
            localStorage.setItem("current_user_id", user.id);
            localStorage.removeItem("pending_user_id");
            navigate("/dashboard");
          } else {
            toast.error("Login rejected by super admin");
          }
          socket.off("login_response", approvalHandler);
        };

        socket.on("login_response", approvalHandler);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle returning users with pending approval
  useEffect(() => {
    const pendingUserId = localStorage.getItem("pending_user_id");
    if (pendingUserId) {
      socket.emit("register", pendingUserId);

      const approvalHandler = ({ approved, token, user }) => {
        if (approved) {
          toast.success("Login approved!");
          login(user, token);
          localStorage.setItem("current_user_id", user.id);
          localStorage.removeItem("pending_user_id");
          navigate("/dashboard");
        }
        socket.off("login_response", approvalHandler);
      };

      socket.on("login_response", approvalHandler);
    }
  }, [login, navigate]);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row login-parent-div relative justify-center">
      {/* Left Image */}
      <div className="absolute inset-0 lg:static lg:w-1/2">
        <img
          src={loginImage}
          alt="Pro Mobile Co"
          className="w-full h-full object-cover lg:object-contain"
        />
      </div>

      {/* Right Form */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-10 bg-white lg:bg-transparent shadow-lg lg:shadow-none rounded-lg">
        <div className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome Back 👋
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to view and manage your customer data.
          </p>

          {/* Employee Code */}
          <div className="mb-4">
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Employee code"
                className="login-input-field"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="relative">
              <RiLockPasswordFill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                className="login-input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Sign In */}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
