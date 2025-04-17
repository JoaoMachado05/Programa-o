import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";

function Home({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    const tipoGuardado = localStorage.getItem("tipo");
    setTipo(tipoGuardado);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("tipo");
    navigate("/");
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="home-container">
      <header className="header">
        <img src="/logo_TUB.jpg" alt="TUB Logo" className="logo" />
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="options">
        <h1 className="title">Escolha uma opção</h1>
        <div className="buttons">
          <button className="option-button" onClick={() => navigateTo("/brts")}>BRTs</button>
          <button className="option-button" onClick={() => navigateTo("/stop")}>Paragens</button>
          <button className="option-button" onClick={() => navigateTo("/traffic-lights")}>Semáforos</button>
          
          {/* Botão Gerir Regras sempre visível */}
          <button
          className="floating-admin-button"
          onClick={() => navigateTo("/regras")}
          title="Gerir Regras"
        >
          ⚙️
        </button>

        </div>
      </div>
    </div>
  );
}

export default Home;

