import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Access Denied! Please Login.");
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/auth/me", { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      .then((res) => {
        console.log("User Data:", res.data);  // ✅ Debugging
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Session Error:", err.response?.data);
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome, {user.name}! 🎉</h2>
        <p>Email: {user.email}</p>
        <button onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
