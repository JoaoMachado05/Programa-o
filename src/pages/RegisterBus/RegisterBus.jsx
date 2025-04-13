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

    const novoAutocarro = {
      matricula,
      modelo,
      capacidade: parseInt(capacidade, 10),
      acessibilidade,
    };

    try {
      const response = await fetch('http://localhost:8080/brts', { // já a apontar para localhost!
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAutocarro),
      });

      if (response.ok) {
        alert('Autocarro adicionado com sucesso!');
        // Limpar formulário
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
            min="1" // não permite negativos nem zero!
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
