import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EditBus.css';

export default function EditBus() {
  const navigate = useNavigate();
  const location = useLocation();
  const { brt } = location.state || {};

  const [matricula, setMatricula] = useState('');
  const [modelo, setModelo] = useState('');
  const [capacidade, setCapacidade] = useState(1);
  const [acessibilidade, setAcessibilidade] = useState(false);

  useEffect(() => {
    if (brt) {
      setMatricula(brt.matricula);
      setModelo(brt.modelo || '');
      setCapacidade(brt.capacidadeMaxima || 1);
      setAcessibilidade(brt.acessibilidade || false);
    }
  }, [brt]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const autocarroAtualizado = {
      matricula,
      modelo,
      capacidadeMaxima: parseInt(capacidade, 10),
      acessibilidade
    };

    try {
      const response = await fetch(`http://localhost:8080/brts/${brt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autocarroAtualizado),
      });

      if (response.ok) {
        alert('Autocarro atualizado com sucesso!');
        navigate('/brts');
      } else {
        alert('Erro ao atualizar autocarro.');
      }
    } catch (error) {
      alert('Erro de comunicação com o servidor.');
    }
  };

  if (!brt) {
    return <div className="error-message">Erro: Dados do autocarro não encontrados.</div>;
  }

  return (
    <div className="edit-bus-container">
      <h2>Editar Autocarro</h2>
      <form onSubmit={handleSubmit} className="edit-bus-form">
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

        <button type="submit">Guardar Alterações</button>
      </form>
    </div>
  );
}
