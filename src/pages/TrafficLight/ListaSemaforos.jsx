import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListaSemaforos.css';

const ListaSemaforos = () => {
  const navigate = useNavigate();
  const [semaforos, setSemaforos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [error, setError] = useState(null);
  
  const REST_API_URL = 'http://localhost:8080/traffic-lights';

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    
    // Adicionar classe ao body para remover margens ou bordas indesejadas
    document.body.classList.add('no-top-border');
    
    // Cleanup function
    return () => {
      document.body.classList.remove('no-top-border');
    };
  }, []);

  // Fetch data using REST API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(REST_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setSemaforos(data);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching semáforos data:', err);
      setError('Falha ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    fetchData();
  };

  const handleBack = () => {
    navigate('/home');
  };

  // Navigate to semaforo details page
  const handleSemaforoClick = (semaforoId) => {
    console.log("Navegando para o semáforo com ID:", semaforoId);
    navigate(`/traffic-light/${semaforoId}`);
  };

  // Formatação do texto do estado atual
  const formatState = (state) => {
    switch (state) {
      case 'RED':
        return 'Vermelho';
      case 'YELLOW':
        return 'Amarelo';
      case 'GREEN':
        return 'Verde';
      default:
        return 'Desconhecido';
    }
  };

  // Formatação do estado operacional
  const formatOperational = (operational) => {
    return operational ? 'Operacional' : 'Fora de serviço';
  };

  return (
    <div className="semaforos-list-container">
      <div className="semaforos-header">
        <button onClick={handleBack} className="back-button">Voltar</button>
        <h1>Lista de Semáforos</h1>
      </div>

      {loading ? (
        <div className="loading-message">Carregando semáforos...</div>
      ) : error ? (
        <div className="error-message">
          {error}
          <button onClick={handleRefresh} className="retry-button">Tentar Novamente</button>
        </div>
      ) : (
        <>
          <div className="semaforos-list">
            {semaforos.length > 0 ? (
              semaforos.map(semaforo => (
                <div 
                  key={semaforo.id} 
                  className={`semaforo-row ${semaforo.operational ? 'operational' : 'non-operational'}`}
                  onClick={() => handleSemaforoClick(semaforo.id)}
                >
                  <div className="semaforo-info">
                    <h3>Semáforo ID: {semaforo.id}</h3>
                    <div className="semaforo-detalhes">
                      <p>
                        <span className="detalhe-label">Estado atual:</span> 
                        <span className={`state-indicator state-${semaforo.currentState.toLowerCase()}`}>
                          {formatState(semaforo.currentState)}
                        </span>
                      </p>
                      <p>
                        <span className="detalhe-label">Status:</span> 
                        <span className={`operational-status ${semaforo.operational ? 'status-ok' : 'status-error'}`}>
                          {formatOperational(semaforo.operational)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button 
                    className="view-details-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSemaforoClick(semaforo.id);
                    }}
                  >
                    Ver Detalhes
                  </button>
                </div>
              ))
            ) : (
              <div className="no-results">Nenhum semáforo encontrado.</div>
            )}
          </div>

          <div className="bottom-controls">
            <button onClick={handleRefresh} className="refresh-button">
              Atualizar Dados
            </button>
            <span className="last-update">
              Última atualização: {lastUpdated}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ListaSemaforos;