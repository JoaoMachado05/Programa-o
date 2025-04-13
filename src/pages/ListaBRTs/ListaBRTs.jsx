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

  useEffect(() => {
    fetchData();
    document.body.classList.add('no-top-border');
    return () => {
      document.body.classList.remove('no-top-border');
    };
  }, []);

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

  const handleRefresh = () => {
    fetchData();
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleBRTClick = (brtId) => {
    navigate(`/brts/${brtId}`);
  };

  const handleEditBRT = (brt) => {
    navigate(`/edit-bus/${brt.id}`, { state: { brt } });
  };

  const handleRemoveBRT = async (id) => {
    if (window.confirm('Tem a certeza que quer remover este autocarro?')) {
      try {
        const response = await fetch(`http://localhost:8080/brts/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Autocarro removido com sucesso!');
          fetchData();
        } else {
          alert('Erro ao remover autocarro.');
        }
      } catch (error) {
        alert('Erro de comunicação com o servidor.');
      }
    }
  };

  const formatVelocidade = (velocidade) => {
    return `${velocidade.toFixed(1)} km/h`;
  };

  const formatTemperatura = (temperatura) => {
    return `${temperatura.toFixed(1)} °C`;
  };

  const determinarStatus = (velocidade) => {
    return velocidade > 0 ? 'active' : 'inactive';
  };

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

      <div className="add-bus-container">
        <button onClick={() => navigate("/register-bus")} className="add-bus-button">
          Adicionar Novo Autocarro
        </button>
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

                    {/* BOTÕES AQUI */}
                    <div className="action-buttons">
                      <button
                        className="view-details-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBRTClick(brt.id);
                        }}
                      >
                        Ver Detalhes
                      </button>

                      <button
                        className="edit-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBRT(brt);
                        }}
                      >
                        Editar
                      </button>

                      <button
                        className="remove-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBRT(brt.id);
                        }}
                      >
                        Remover
                      </button>
                    </div>

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
