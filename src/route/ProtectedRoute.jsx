// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem("user"); // or use context/auth state

    return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
