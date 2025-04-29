import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Stop.css";

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
    if (percentagem < 50) return "ocupacao-baixa";
    if (percentagem < 80) return "ocupacao-media";
    return "ocupacao-alta";
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
    <div className="container">
      <h1>
        <button className="back-button" onClick={handleBack}>Voltar</button>
        Paragens
      </h1>

      {/* Botões de Ação */}
      <div className="button-group">
        <Link to="/stop/add">
          <button>Adicionar Paragem</button>
        </Link>
        <Link to="/stop/remove">
          <button>Remover Paragem</button>
        </Link>
        <Link to="/monitorizar-risco">
        <button className="monitor-button">Monitorizar Risco ⚠️</button>
        </Link>
      </div>

      {/* Listagem das Paragens */}
      <div className="scroll-container">
        {loading ? (
          <p style={{ color: "white", textAlign: "center", padding: "20px" }}>
            A carregar dados...
          </p>
        ) : (
          stops.map(({ id, nome, lotacaoAtual, capacidadeMaxima, temperaturaAtual, percentagemOcupacao, tempoAteProximoAutocarro }) => (
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
              <button className="details-button" onClick={() => goToStopDetails(id)}>
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

      {/* Controlos no Fundo */}
      <div className="bottom-controls">
        <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
          {loading ? "A atualizar..." : "Atualizar Dados"}
        </button>
        <div className="last-update">
          Última Atualização: {formatDateTime(lastUpdate)}
        </div>
      </div>
    </div>
  );
};

export default Stop;
