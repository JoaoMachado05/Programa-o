import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Stop.css"; 

const Stop = () => {
  const [stops, setStops] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const REST_API_URL = "http://localhost:8080/stops";

  const fetchStops = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(REST_API_URL);
      if (!response.ok) throw new Error("Erro na resposta do servidor");
      const data = await response.json();
      setStops(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erro ao buscar paragens:", error.message);
      setError("Falha ao carregar dados. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
    
    // Adicionar classe ao body
    document.body.classList.add('no-top-border');
    
    // Cleanup function
    return () => {
      document.body.classList.remove('no-top-border');
    };
  }, []);

  // Função para navegação com log para depuração
  const goToStopDetails = (id) => {
    console.log(`Navegando para detalhes da paragem ${id}`);
    navigate(`/stops/${id}`);
  };

  // Nova função para remover uma paragem
  const handleRemoveStop = async (id) => {
    if (window.confirm("Tem certeza que deseja remover esta paragem?")) {
      setLoading(true);
      try {
        const response = await fetch(`${REST_API_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error("Erro ao remover a paragem");
        }
        
        // Atualiza a lista após remover
        setStops(stops.filter(stop => stop.id !== id));
        
        // Mostra mensagem de sucesso
        alert("Paragem removida com sucesso!");
      } catch (error) {
        console.error("Erro ao remover paragem:", error.message);
        alert("Erro ao remover paragem. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    navigate("/home");
  };

  const handleRefresh = () => {
    fetchStops();
  };

  const getOcupacaoClass = (percentagem) => {
    if (percentagem < 50) return "baixa";
    if (percentagem < 80) return "media";
    return "alta";
  };

  const getOcupacaoText = (percentagem) => {
    if (percentagem < 50) return "Baixa";
    if (percentagem < 80) return "Média";
    return "Alta";
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Função para determinar o ícone de temperatura baseado no valor
  const getTemperatureIcon = (temp) => {
    if (temp < 15) return "fas fa-thermometer-quarter";
    if (temp < 25) return "fas fa-thermometer-half";
    return "fas fa-thermometer-full";
  };

  // Função para determinar a cor do texto baseado na temperatura
  const getTemperatureColor = (temp) => {
    if (temp < 15) return "#0288d1"; // Azul para frio
    if (temp < 25) return "#43a047"; // Verde para temperatura normal
    return "#e53935"; // Vermelho para quente
  };

  // Função para determinar a cor do texto baseado no tempo de espera
  const getWaitTimeColor = (minutes) => {
    if (minutes <= 5) return "#2e7d32"; // Verde para curto tempo
    if (minutes <= 15) return "#f57f17"; // Amarelo para tempo médio
    return "#c62828"; // Vermelho para longo tempo
  };

  return (
    <div className="paragens-list-container">
      <div className="paragens-header">
        <button onClick={handleBack} className="back-button">
          <i className="fas fa-arrow-left"></i>
          Voltar
        </button>
        <h1>Paragens</h1>
      </div>

      {/* Botões de ação no topo */}
      <div className="paragens-actions-top">
        <Link to="/stop/add" className="add-paragem-button">
          <i className="fas fa-plus"></i>
          Adicionar Paragem
        </Link>
      </div>

      {loading ? (
        <div className="loading-message">
          <i className="fas fa-spinner fa-spin"></i>
          <p>A carregar dados...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            <i className="fas fa-sync-alt"></i>
            Tentar Novamente
          </button>
        </div>
      ) : (
        <>
          <div className="paragens-list">
            {stops.length > 0 ? (
              stops.map(({ 
                id, 
                nome, 
                lotacaoAtual, 
                capacidadeMaxima, 
                temperaturaAtual, 
                percentagemOcupacao,
                tempoAteProximoAutocarro
              }) => (
                <div 
                  key={id} 
                  className={`paragem-row ${getOcupacaoClass(percentagemOcupacao)}-ocupacao`}
                >
                  <div className="paragem-info">
                    <h3>
                      <i className="fas fa-bus-alt"></i>
                      {nome}
                    </h3>
                    <div className="paragem-detalhes">
                      <p>
                        <span className="detalhe-label">Ocupação</span> 
                        <span className={`ocupacao-indicator ocupacao-${getOcupacaoClass(percentagemOcupacao)}`}>
                          {getOcupacaoText(percentagemOcupacao)} ({percentagemOcupacao?.toFixed(1) || "N/A"}%)
                        </span>
                      </p>
                      <p>
                        <span className="detalhe-label">Lotação</span> 
                        <span>{lotacaoAtual}/{capacidadeMaxima}</span>
                      </p>
                      <p>
                        <span className="detalhe-label">Próximo autocarro</span> 
                        <span className="tempo-espera">
                          <i className="fas fa-clock"></i>
                          {tempoAteProximoAutocarro} min
                        </span>
                      </p>
                      <p>
                        <span className="detalhe-label">Temperatura</span> 
                        <span className="temperatura">
                          <i className={getTemperatureIcon(temperaturaAtual)}></i>
                          {temperaturaAtual} °C
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="paragem-actions">
                    <button 
                      className="view-details-button"
                      onClick={() => goToStopDetails(id)}
                    >
                      <i className="fas fa-info-circle"></i>
                      Ver Detalhes
                    </button>
                    <Link 
                      to={`/stop/edit/${id}`} 
                      className="edit-button"
                    >
                      <i className="fas fa-edit"></i>
                      Editar
                    </Link>
                    <button 
                      className="delete-button"
                      onClick={() => handleRemoveStop(id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                      Remover
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>Nenhuma paragem encontrada.</p>
              </div>
            )}
          </div>

          <div className="bottom-controls">
            <button 
              onClick={handleRefresh} 
              className="refresh-button" 
              disabled={loading}
            >
              <i className="fas fa-sync-alt"></i>
              {loading ? "A atualizar..." : "Atualizar Dados"}
            </button>
            <div className="last-update">
              <i className="fas fa-clock"></i>
              Última Atualização: {formatDateTime(lastUpdate)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Stop;