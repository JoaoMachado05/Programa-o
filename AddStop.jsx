
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Stop.css";

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
        navigate("/stop");
      } else {
        alert("Erro ao adicionar paragem.");
      }
    } catch (error) {
      alert("Erro de rede.");
    }
  };

  return (
    <div className="form-container">
      <h2>Adicionar Nova Paragem</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Nome*
          <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
        </label>
        <label>
          Capacidade Máxima*
          <input type="number" name="capacidadeMaxima" value={formData.capacidadeMaxima} onChange={handleChange} required />
        </label>
        <label>
          Lotação Atual
          <input type="number" name="lotacaoAtual" value={formData.lotacaoAtual} onChange={handleChange} />
        </label>
        <label>
          Temperatura Atual
          <input type="number" step="0.1" name="temperaturaAtual" value={formData.temperaturaAtual} onChange={handleChange} />
        </label>
        <label>
          Longitude*
          <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} required />
        </label>
        <label>
          Latitude*
          <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} required />
        </label>
        <label>
          Min. até próximo autocarro
          <input type="number" name="tempoAteProximoAutocarro" value={formData.tempoAteProximoAutocarro} onChange={handleChange} />
        </label>
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate("/stop")}>Cancelar</button>
          <button type="submit" className="submit-btn">Adicionar Paragem</button>
        </div>
      </form>
    </div>
  );
};

export default AddStop;
