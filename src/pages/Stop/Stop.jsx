import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Stop.css";

const Stop = () => {
  const [stops, setStops] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await fetch("http://localhost:8080/stops");
        if (!response.ok) throw new Error("Erro na resposta do servidor");
        const data = await response.json();
        setStops(data);
      } catch (error) {
        console.error("Erro ao buscar paragens:", error.message);
      }
    };
    fetchStops();
  }, []);

  const goToStopDetails = (id) => {
    navigate(`/stops/${id}`);
  };

  return (
    <div className="container">
      <h1>Paragens</h1>
      <div className="scroll-container">
        {stops.map(({ id, nome, lotacaoAtual, capacidadeMaxima, temperaturaAtual, percentagemOcupacao }) => (
          <div key={id} className="stop-row">
            <h2>{nome}</h2>
            <p>Lotação Atual: {lotacaoAtual}</p>
            <p>Capacidade Máxima: {capacidadeMaxima}</p>
            <p>Temperatura: {temperaturaAtual} °C</p>
            <p>
              Ocupação: {percentagemOcupacao !== null && percentagemOcupacao !== undefined
                ? percentagemOcupacao.toFixed(2)
                : "N/A"}%
            </p>
            <button className="details-button" onClick={() => goToStopDetails(id)}>
              Ver Detalhes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stop;
