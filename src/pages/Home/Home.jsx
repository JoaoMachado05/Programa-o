import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";

function Home({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem("isAuthenticated", "false");
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
          <button className="option-button" onClick={() => navigateTo("/vias")}>Vias</button>
          <button className="option-button" onClick={() => navigateTo("/stop")}>Paragens</button>
          <button className="option-button" onClick={() => navigateTo("/semaforos")}>Semáforos</button>
        </div>
      </div>
    </div>
  );
}

export default Home;