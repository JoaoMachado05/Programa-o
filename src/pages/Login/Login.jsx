import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // importante para manter a sessão (cookies)
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        setMessage("Login bem-sucedido!");
        setMessageType("success");
        setIsAuthenticated(true);
        setTimeout(() => navigate("/home"), 1500);
      } else {
        const errorText = await response.text();
        setMessage(errorText || "Email ou password incorretos!");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setMessage("Erro na comunicação com o servidor!");
      setMessageType("error");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="login-container">
      <div className="content-wrapper">
        <div className="branding-section">
          <img src="/logo_TUB.jpg" alt="TUB Logo" className="logo" />
          <div className="branding-content">
            <h1>Sistema de Gestão TUB</h1>
            <p>Digital Twins</p>
          </div>
        </div>

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
