import { useState } from "react";
import { useNavigate } from "react-router-dom";

const users = {
  provider: { username: "provider", password: "provider123" },
  payer: { username: "payer", password: "payer123" }
};

export default function LoginPage({ setCurrentRole }) {
  const [formData, setFormData] = useState({ role: "provider", username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const validUser = users[formData.role];
    if (formData.username === validUser.username && formData.password === validUser.password) {
      setCurrentRole(formData.role);
      navigate(formData.role === "payer" ? "/requests" : "/submit");
      return;
    }

    setErrorMessage("Invalid credentials. Use the correct role and password.");
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <h1>Healthcare Login</h1>
        <p>Login as provider or payer to continue.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} className="form-input">
            <option value="provider">Provider</option>
            <option value="payer">Payer</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter password"
            required
          />
        </div>

        {errorMessage && <div className="message error">{errorMessage}</div>}

        <button type="submit" className="submit-btn">
          Login
        </button>
      </form>
    </div>
  );
}
