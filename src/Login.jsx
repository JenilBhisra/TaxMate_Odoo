import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css"; // ✅ Use Auth.css for styling

const Login = () => {
  useEffect(() => console.log("✅ Login Component Loaded"), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/auth/login", { email, password });

      // ✅ Debugging: Check if token is received
      console.log("Login Response:", res.data);

      // ✅ Save token in Local Storage & verify
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        console.log("Token stored in Local Storage:", localStorage.getItem("token")); // ✅ Verify storage
      } else {
        console.error("No token received from backend.");
        setError("No token received, please try again.");
        return;
      }

      alert("✅ Login Successful! Redirecting...");
      navigate("/dashboard");  // ✅ Redirect to Dashboard
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* ✅ Add "Don't have an account?" Link */}
        <p className="switch-auth">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
