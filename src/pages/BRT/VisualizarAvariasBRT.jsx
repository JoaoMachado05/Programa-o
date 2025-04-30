import { useState, useEffect } from "react";
import "./VisualizarAvariasBRT.css";

const VisualizarAvariasBRT = ({ isOpen, onClose, brtId }) => {
  const [activeTab, setActiveTab] = useState("ativas");
  const [avariasAtivas, setAvariasAtivas] = useState([]);
  const [avariasResolvidas, setAvariasResolvidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Base URL para API - pode ser movido para arquivo de configuração
  const API_BASE_URL = "http://localhost:8080";

  useEffect(() => {
    if (isOpen && brtId) {
      fetchAvarias();
    }
  }, [isOpen, brtId, activeTab]);

  const fetchAvarias = async () => {
    if (!brtId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let endpoint;
      
      // Usar endpoints específicos baseados na tab ativa
      if (activeTab === "ativas") {
        endpoint = `${API_BASE_URL}/brts/${brtId}/avarias/ativas`;
      } else if (activeTab === "resolvidas") {
        endpoint = `${API_BASE_URL}/brts/${brtId}/avarias/resolvidas`;
      } else {
        // Se por algum motivo a tab não for reconhecida, buscar todas
        endpoint = `${API_BASE_URL}/brts/${brtId}/avarias`;
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar avarias: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (activeTab === "ativas") {
        setAvariasAtivas(data);
      } else if (activeTab === "resolvidas") {
        setAvariasResolvidas(data);
      } else {
        // Se usamos o endpoint geral, filtrar os dados
        setAvariasAtivas(data.filter(avaria => !avaria.resolvida));
        setAvariasResolvidas(data.filter(avaria => avaria.resolvida));
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar avarias:", error.message);
      setError("Falha ao carregar as avarias. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  // Função para resolver uma avaria
  const resolverAvaria = async (avariaId) => {
    if (!confirm("Tem certeza que deseja marcar esta avaria como resolvida?")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/brts/avarias/${avariaId}/resolver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao resolver avaria: ${response.status}`);
      }
      
      // Atualizar a lista de avarias após resolução
      fetchAvarias();
      
    } catch (error) {
      console.error("Erro ao resolver avaria:", error.message);
      alert("Não foi possível resolver a avaria. Por favor, tente novamente.");
    }
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-PT');
    } catch (error) {
      return dateString;
    }
  };

  // Função para obter texto e classe da gravidade
  const getGravidadeInfo = (gravidade) => {
    switch(gravidade) {
      case 1:
        return { texto: "Grave", classe: "alta" };
      case 2:
        return { texto: "Moderada", classe: "média" };
      case 3:
        return { texto: "Leve", classe: "baixa" };
      default:
        return { texto: "Desconhecida", classe: "desconhecida" };
    }
  };

  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="visualizar-avarias-brt-overlay" onClick={(e) => {
      // Fechar o modal apenas se clicar no fundo (não em seu conteúdo)
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="visualizar-avarias-brt-modal">
        <div className="visualizar-avarias-brt-header">
          <h2>Histórico de Avarias - BRT #{brtId}</h2>
          <button className="visualizar-avarias-brt-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="visualizar-avarias-brt-tabs-container">
          <div className="visualizar-avarias-brt-tabs-header">
            <button 
              className={`visualizar-avarias-brt-tab-button ${activeTab === "ativas" ? "active" : ""}`}
              onClick={() => setActiveTab("ativas")}
            >
              Avarias Ativas
              <span className="visualizar-avarias-brt-count">{avariasAtivas.length}</span>
            </button>
            <button 
              className={`visualizar-avarias-brt-tab-button ${activeTab === "resolvidas" ? "active" : ""}`}
              onClick={() => setActiveTab("resolvidas")}
            >
              Avarias Resolvidas
              <span className="visualizar-avarias-brt-count">{avariasResolvidas.length}</span>
            </button>
          </div>
          
          <div className="visualizar-avarias-brt-tab-content">
            {loading ? (
              <div className="visualizar-avarias-brt-loading-container">
                <div className="visualizar-avarias-brt-loader-small"></div>
                <p>A carregar avarias...</p>
              </div>
            ) : error ? (
              <div className="visualizar-avarias-brt-error-message">
                <p>{error}</p>
                <button onClick={fetchAvarias} className="visualizar-avarias-brt-retry-button">Tentar novamente</button>
              </div>
            ) : (
              <>
                {activeTab === "ativas" && (
                  <>
                    {avariasAtivas.length === 0 ? (
                      <p className="visualizar-avarias-brt-no-data-message">Não existem avarias ativas neste momento.</p>
                    ) : (
                      <table className="visualizar-avarias-brt-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Data de Reporte</th>
                            <th>Gravidade</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {avariasAtivas.map(avaria => {
                            const gravidadeInfo = getGravidadeInfo(avaria.gravidade);
                            return (
                              <tr key={avaria.id} className={`visualizar-avarias-brt-prioridade-${gravidadeInfo.classe}`}>
                                <td>{avaria.id}</td>
                                <td>{avaria.tipo}</td>
                                <td>{formatDate(avaria.dataReporte)}</td>
                                <td>
                                  <span className={`visualizar-avarias-brt-tag-prioridade ${gravidadeInfo.classe}`}>
                                    {gravidadeInfo.texto}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="visualizar-avarias-brt-resolver-button"
                                    onClick={() => resolverAvaria(avaria.id)}
                                  >
                                    Resolver
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
                
                {activeTab === "resolvidas" && (
                  <>
                    {avariasResolvidas.length === 0 ? (
                      <p className="visualizar-avarias-brt-no-data-message">Não existem avarias resolvidas registadas.</p>
                    ) : (
                      <table className="visualizar-avarias-brt-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Data de Reporte</th>
                            <th>Data de Resolução</th>
                            <th>Gravidade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {avariasResolvidas.map(avaria => {
                            const gravidadeInfo = getGravidadeInfo(avaria.gravidade);
                            return (
                              <tr key={avaria.id}>
                                <td>{avaria.id}</td>
                                <td>{avaria.tipo}</td>
                                <td>{formatDate(avaria.dataReporte)}</td>
                                <td>{formatDate(avaria.dataResolucao)}</td>
                                <td>
                                  <span className={`visualizar-avarias-brt-tag-prioridade ${gravidadeInfo.classe}`}>
                                    {gravidadeInfo.texto}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarAvariasBRT;