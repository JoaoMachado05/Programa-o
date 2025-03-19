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
    navigate(`/brts/${brtId}`);
  };

  // Formatar velocidade para mostrar em km/h com uma casa decimal
  const formatVelocidade = (velocidade) => {
    return `${velocidade.toFixed(1)} km/h`;
  };

  // Formatar temperatura para mostrar em graus Celsius com uma casa decimal
  const formatTemperatura = (temperatura) => {
    return `${temperatura.toFixed(1)} °C`;
  };

  // Determinar status baseado na velocidade
  const determinarStatus = (velocidade) => {
    return velocidade > 0 ? 'active' : 'inactive';
  };

  // Exibir apenas texto de ocupação
  const formatarOcupacao = (lotacaoAtual, capacidadeMaxima) => {
    const percentual = (lotacaoAtual / capacidadeMaxima) * 100;
    return {
      texto: `${percentual.toFixed(0)}% (${lotacaoAtual}/${capacidadeMaxima})`,
      classe: percentual < 50 ? 'low' : percentual < 85 ? 'medium' : 'high'
    };
  };

  return (
    <div className="brts-list-container">
      <div className="brts-header">
        <button onClick={handleBack} className="back-button">Voltar</button>
        <h1>Lista de BRTs</h1>
      </div>

      {loading ? (
        <div className="loading-message">Carregando autocarros...</div>
      ) : error ? (
        <div className="error-message">
          {error}
          <button onClick={handleRefresh} className="retry-button">Tentar Novamente</button>
        </div>
      ) : (
        <>
          <div className="brts-list">
            {brts.length > 0 ? (
              brts.map(brt => {
                const ocupacao = formatarOcupacao(brt.lotacaoAtual, brt.capacidadeMaxima);
                
                return (
                  <div 
                    key={brt.id} 
                    className={`brt-row status-${determinarStatus(brt.velocidade)}`}
                    onClick={() => handleBRTClick(brt.id)}
                  >
                    <div className="brt-info">
                      <h3>Matrícula: {brt.matricula}</h3>
                      <p className="brt-linha">Linha: {brt.linhaAtual}</p>
                      <div className="brt-detalhes">
                        <p><span className="detalhe-label">Velocidade:</span> {formatVelocidade(brt.velocidade)}</p>
                        <p><span className="detalhe-label">Temperatura:</span> {formatTemperatura(brt.temperaturaAtual)}</p>
                        <p><span className="detalhe-label">Lotação:</span> <span className={`occupancy-${ocupacao.classe}`}>{ocupacao.texto}</span></p>
                      </div>
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
                );
              })
            ) : (
              <div className="no-results">Nenhum autocarro encontrado.</div>
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