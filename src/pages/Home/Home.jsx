import React from 'react';

function Home({ setIsAuthenticated }) {
  const handleLogout = () => {
    setIsAuthenticated(false); // Atualiza o estado de autenticação
    localStorage.setItem("isAuthenticated", "false"); // Limpa o localStorage
    navigate("/");
  };

  return (
    <div>
      <h1>Bem-vindo à página Home!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;
