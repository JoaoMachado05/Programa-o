import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Simple custom components to replace the missing UI components
const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children }) => (
  <div className="p-6">{children}</div>
);

const Button = ({ children, className = "", onClick }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Paragens</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stops.map(({ id, nome, lotacaoAtual, capacidadeMaxima, temperaturaAtual, percentagemOcupacao }) => (
          <Card key={id} className="p-4 shadow-lg">
            <CardContent>
              <h2 className="text-xl font-semibold">{nome}</h2>
              <p>Lotação Atual: {lotacaoAtual}</p>
              <p>Capacidade Máxima: {capacidadeMaxima}</p>
              <p>Temperatura Atual: {temperaturaAtual} °C</p>
              <p>
                Percentagem de Ocupação:{" "}
                {percentagemOcupacao !== null && percentagemOcupacao !== undefined
                  ? percentagemOcupacao.toFixed(2)
                  : "N/A"}
                %
              </p>
              <Button className="mt-4" onClick={() => goToStopDetails(id)}>
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Stop;