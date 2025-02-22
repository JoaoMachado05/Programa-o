import { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" ou "error"

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "admin@gmail.com" && password === "12345") {
      setMessage("Login bem-sucedido!");
      setMessageType("success"); // Define a cor verde
    } else {
      setMessage("Email ou password incorretos!");
      setMessageType("error"); // Define a cor vermelha
    }

    // Remove a notificação após 3 segundos
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

      {}
      {message && <div className={`notification ${messageType}`}>{message}</div>}
    </div>
  );
}

export default Login;
