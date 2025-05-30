import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddStop.css";

const AddStop = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    capacidadeMaxima: "",
    lotacaoAtual: "",
    temperaturaAtual: "",
    longitude: "",
    latitude: "",
    tempoAteProximoAutocarro: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/stops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacidadeMaxima: parseInt(formData.capacidadeMaxima),
          lotacaoAtual: parseInt(formData.lotacaoAtual),
          temperaturaAtual: parseFloat(formData.temperaturaAtual),
          tempoAteProximoAutocarro: parseInt(formData.tempoAteProximoAutocarro)
        })
      });

      if (response.ok) {
        alert("Paragem adicionada com sucesso!");
        navigate("/stop"); // ou outra rota
      } else {
        alert("Erro ao adicionar paragem.");
      }
    } catch (error) {
      alert("Erro de rede.");
    }
  };

  const handleCancel = () => {
    navigate(-1); // Voltar à página anterior
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Adicionar Nova Paragem</h2>
      <form className="form-box" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome*"
          value={formData.nome}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="capacidadeMaxima"
          placeholder="Capacidade Máxima*"
          value={formData.capacidadeMaxima}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="lotacaoAtual"
          placeholder="Lotação Atual"
          value={formData.lotacaoAtual}
          onChange={handleChange}
        />
        <input
          type="number"
          name="temperaturaAtual"
          placeholder="Temperatura Atual"
          value={formData.temperaturaAtual}
          onChange={handleChange}
        />
        <input
          type="number"
          name="longitude"
          placeholder="Longitude*"
          value={formData.longitude}
          onChange={handleChange}
          required
          step="any"
        />
        <input
          type="number"
          name="latitude"
          placeholder="Latitude*"
          value={formData.latitude}
          onChange={handleChange}
          required
          step="any"
        />
        <input
          type="number"
          name="tempoAteProximoAutocarro"
          placeholder="Min. até próximo autocarro"
          value={formData.tempoAteProximoAutocarro}
          onChange={handleChange}
        />
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancelar
          </button>
          <button type="submit" className="submit-btn">
            Adicionar Paragem
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStop;