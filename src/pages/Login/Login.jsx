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
      <div className="content-wrapper">
        {/* Seção de branding (lado esquerdo) */}
        <div className="branding-section">
          <img src="/logo_TUB.jpg" alt="TUB Logo" className="logo" />
          <div className="branding-content">
            <h1>Sistema de Gestão TUB</h1>
            <p>Digital Twins</p>
          </div>
        </div>
        
        {/* Seção de login (lado direito) */}
        <div className="login-section">
          <div className="login-header">
            <h2>Login</h2>
            <p>Entre com suas credenciais para acessar o sistema</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="login-button">Entrar</button>
          </form>
        </div>
      </div>
      
      <div className="wave"></div>
      
      {message && <div className={`notification ${messageType}`}>{message}</div>}
    </div>
  );
}

export default Login;