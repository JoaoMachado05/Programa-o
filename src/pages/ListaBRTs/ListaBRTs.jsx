import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListaBRTs.css';

const ListaBRTs = () => {
  const navigate = useNavigate();
  const [brts, setBrts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [error, setError] = useState(null);
  
  const REST_API_URL = 'http://localhost:8080/brts';

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
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
      setBrts(data);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching BRT data:', err);
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

  // Navigate to BRT details page
  const handleBRTClick = (brtId) => {
    console.log("Navegando para o BRT com ID:", brtId);
    navigate(`/brt/${brtId}`);
  };

  return (
    <div className="brts-list-container">
      <div className="brts-header">
        <button onClick={handleBack} className="back-button">Voltar</button>
        <h1>Lista de BRTs</h1>
      </div>

      {loading ? (
        <div className="loading-message">Carregando BRTs...</div>
      ) : error ? (
        <div className="error-message">
          {error}
          <button onClick={handleRefresh} className="retry-button">Tentar Novamente</button>
        </div>
      ) : (
        <>
          <div className="brts-list">
            {brts.length > 0 ? (
              brts.map(brt => (
                <div 
                  key={brt.id} 
                  className={`brt-row status-${brt.status}`}
                  onClick={() => handleBRTClick(brt.id)}
                >
                  <div className="brt-info">
                    <h3>{brt.nome}</h3>
                    <p>{brt.rota}</p>
                  </div>
                  <div className="brt-status">
                    <span className={`status-indicator ${brt.status}`}>
                      {brt.status === 'active' ? 'Ativo' : 'Parado'}
                    </span>
                    <p className="brt-occupancy">{brt.lotacao}</p>
                  </div>
                  <button 
                    className="view-details-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBRTClick(brt.id);
                    }}
                  >
                    Ver Detalhes
                  </button>
                </div>
              ))
            ) : (
              <div className="no-results">Nenhum BRT encontrado.</div>
            )}
          </div>

          <div className="refresh-section">
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

export default ListaBRTs;