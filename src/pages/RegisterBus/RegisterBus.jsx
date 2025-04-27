// src/pages/RegisterBus/RegisterBus.jsx

import { useState } from 'react';
import './RegisterBus.css';

export default function RegisterBus() {
  const [matricula, setMatricula] = useState('');
  const [modelo, setModelo] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [acessibilidade, setAcessibilidade] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const capacidadeFinal = capacidade ? parseInt(capacidade, 10) : 0;

    const novoAutocarro = {
      matricula,
      modelo,
      capacidade_maxima: parseInt(capacidade, 10),
      acessibilidade,
      lotacao_atual: Math.floor(parseInt(capacidade, 10) / 2),  // 50% de ocupação
      linha_atual: "Linha 12",
      velocidade: 45.7,
      temperatura_atual: 22.5,
      latitude: 41.545,    // valores fake mas válidos
      longitude: -8.426,
      atraso_minutos: 0,
      proxima_paragem_horario: null,
      last_temperature: 22.5,
      temperature_action: null,
      status: "IN_SERVICE"
    };
    

    console.log('Novo autocarro enviado:', JSON.stringify(novoAutocarro));

    try {
      const response = await fetch('http://localhost:8080/brts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAutocarro),
      });

      if (response.ok) {
        alert('Autocarro adicionado com sucesso!');
        setMatricula('');
        setModelo('');
        setCapacidade('');
        setAcessibilidade(false);
      } else {
        alert('Erro ao adicionar autocarro.');
      }
    } catch (error) {
      alert('Erro de comunicação com o servidor.');
    }
  };

  return (
    <div className="register-bus-container">
      <h2>Adicionar Novo Autocarro</h2>
      <form onSubmit={handleSubmit} className="register-bus-form">
        <label>
          Matrícula:
          <input 
            type="text" 
            value={matricula} 
            onChange={(e) => setMatricula(e.target.value)} 
            required 
          />
        </label>

        <label>
          Modelo:
          <input 
            type="text" 
            value={modelo} 
            onChange={(e) => setModelo(e.target.value)} 
            required 
          />
        </label>

        <label>
          Capacidade:
          <input 
            type="number" 
            min="1"
            value={capacidade} 
            onChange={(e) => setCapacidade(e.target.value)} 
            required 
          />
        </label>

        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={acessibilidade} 
            onChange={(e) => setAcessibilidade(e.target.checked)} 
          />
          Acessibilidade para pessoas com mobilidade reduzida
        </label>

        <button type="submit">Adicionar Autocarro</button>
      </form>
    </div>
  );
}
