// src/pages/Stop/MonitorizarRisco.jsx

import React, { useState } from 'react';
import axios from 'axios';
import './Stop.css'; // Usa o estilo partilhado da paragem
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function MonitorizarRisco() {
const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const idInicial = queryParams.get("idParagem") || "";
const [idParagem, setIdParagem] = useState(idInicial);
const isPreenchido = !!idInicial;

  const [tipoRisco, setTipoRisco] = useState('');
  const [resultado, setResultado] = useState('');
  const navigate = useNavigate();

  const enviarEventoRisco = async () => {
    try {
      const response = await axios.post('http://localhost:8080/anomaly-monitor/evento-risco', {
        idParagem: Number(idParagem),
        imagemBase64: '',
        tipoRisco: tipoRisco
      });
      setResultado("✅ Evento enviado com sucesso!");
    } catch (error) {
      console.error('Erro ao enviar evento de risco', error);
      setResultado('❌ Erro ao enviar evento.');
    }
  };

  const voltar = () => {
    navigate("/stop");
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Monitorizar Risco na Paragem</h2>
        <div className="form-grid">
          <label>
            ID da Paragem:
            <input
              type="number"
              value={idParagem}
              onChange={(e) => setIdParagem(e.target.value)}
              placeholder="Introduza o ID"
              required
            />
          </label>

          <label>
            Tipo de Risco:
            <input
              type="text"
              value={tipoRisco}
              onChange={(e) => setTipoRisco(e.target.value)}
              placeholder="Ex: vandalismo, aglomeração"
              required
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="cancel-btn" onClick={voltar}>
            Cancelar
          </button>
          <button className="submit-btn" onClick={enviarEventoRisco}>
            Enviar Evento de Risco
          </button>
        </div>

        {resultado && (
          <p
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: resultado.includes('sucesso') ? 'green' : 'red'
            }}
          >
            {resultado}
          </p>
        )}
      </div>
    </div>
  );
}

export default MonitorizarRisco;
