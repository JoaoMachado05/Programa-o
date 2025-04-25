import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RemoveStop = () => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [nome, setNome] = useState("");

  const handleRemove = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/stops/${id}`, {
        method: "DELETE"
      });
  
      if (response.status === 204) {
        alert("Paragem removida com sucesso!");
        navigate("/stop");
      } else if (response.status === 404) {
        alert("Paragem não encontrada.");
      } else {
        alert("Erro ao remover paragem.");
      }
    } catch (error) {
      alert("Erro de rede ao tentar remover paragem.");
    }
  };
  

  return (
    <div>
      <h2>Remover Paragem</h2>
      <form onSubmit={handleRemove}>
        <input
          type="text"
          placeholder="ID da paragem"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nome da paragem"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <button type="submit">Remover</button>
      </form>
    </div>
  );
};

export default RemoveStop;
