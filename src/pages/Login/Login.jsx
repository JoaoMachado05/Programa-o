import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (email === "admin@gmail.com" && password === "12345") {
      setMessage("Login bem-sucedido!");
      setMessageType("success");
      setIsAuthenticated(true); 
  
      setTimeout(() => navigate("/home"), 1500);
    } else {
      setMessage("Email ou password incorretos!");
      setMessageType("error");
    }
  
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="login-container">
      <img src="/logo_TUB.jpg" alt="Logo TUB" className="logo" />
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
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
        <button type="submit">Entrar</button>
      </form> 

      {message && <div className={`notification ${messageType}`}>{message}</div>}
    </div>
  );
}

export default Login;
