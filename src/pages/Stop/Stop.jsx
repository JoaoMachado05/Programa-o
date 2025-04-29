import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Stop.css";
import { Link } from "react-router-dom";

const Stop = () => {
  const [stops, setStops] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchStops = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/stops");
      if (!response.ok) throw new Error("Erro na resposta do servidor");
      const data = await response.json();
      setStops(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erro ao buscar paragens:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  const goToStopDetails = (id) => {
    navigate(`/stops/${id}`);
  };

  const handleBack = () => {
    navigate("/home");
  };

  const handleRefresh = () => {
    fetchStops();
  };

  const getOcupacaoClass = (percentagem) => {
    if (percentagem < 50) return "stop-ocupacao-baixa";
    if (percentagem < 80) return "stop-ocupacao-media";
    return "stop-ocupacao-alta";
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

  return (
    <div className="stop-container">
      <h1>Paragens</h1>

      <div className="stop-action-buttons">
        <Link to="/stop/add">
          <button className="stop-action-button">Adicionar Paragem</button>
        </Link>
        <Link to="/stop/remove">
          <button className="stop-action-button">Remover Paragem</button>
        </Link>
      </div>
      
      {/* Botão voltar posicionado acima da lista */}
      <div className="stop-back-button-container">
        <button className="stop-back-button" onClick={handleBack}>Voltar</button>
      </div>

      <div className="stop-scroll-container">
        {loading ? (
          <p style={{ color: "white", textAlign: "center", padding: "20px" }}>
            A carregar dados...
          </p>
        ) : (
          stops.map(({ 
            id, 
            nome, 
            lotacaoAtual, 
            capacidadeMaxima, 
            temperaturaAtual, 
            percentagemOcupacao,
            tempoAteProximoAutocarro
          }) => (
            <div key={id} className="stop-row">
              <h2>{nome}</h2>
              <p>Lotação Atual: {lotacaoAtual}</p>
              <p>Capacidade Máxima: {capacidadeMaxima}</p>
              <p>Temperatura: {temperaturaAtual} °C</p>
              <p>Próximo Autocarro: {tempoAteProximoAutocarro} min</p>
              <p className={getOcupacaoClass(percentagemOcupacao)}>
                Ocupação: {percentagemOcupacao !== null && percentagemOcupacao !== undefined
                  ? percentagemOcupacao.toFixed(2)
                  : "N/A"}%
              </p>
              <button className="stop-details-button" onClick={() => goToStopDetails(id)}>
                Ver Detalhes
              </button>
            </div>
          ))
        )}
        {!loading && stops.length === 0 && (
          <p style={{ color: "white", textAlign: "center", padding: "20px" }}>
            Não foram encontradas paragens.
          </p>
        )}
      </div>

      <div className="stop-bottom-controls">
        <button className="stop-refresh-button" onClick={handleRefresh} disabled={loading}>
          {loading ? "A atualizar..." : "Atualizar Dados"}
        </button>
        <div className="stop-last-update">
          Última Atualização: {formatDateTime(lastUpdate)}
        </div>
      </div>
    </div>
  );
};

export default Stop;