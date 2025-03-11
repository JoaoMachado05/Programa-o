import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./StopDetails.css";

const StopDetails = () => {
  const { id } = useParams();
  const [stop, setStop] = useState(null);

  useEffect(() => {
    const fetchStopDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/stops/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes da paragem");

        const data = await response.json();
        setStop(data);
      } catch (error) {
        console.error("Erro:", error.message);
      }
    };

    fetchStopDetails();
  }, [id]);

  if (!stop) return <p className="loading">A carregar...</p>;

  return (
    <div className="stop-details-container">
      <h1>{stop.nome}</h1>
      <div className="details">
        <p><strong>Lotação Atual:</strong> {stop.lotacaoAtual}</p>
        <p><strong>Capacidade Máxima:</strong> {stop.capacidadeMaxima}</p>
        <p><strong>Temperatura:</strong> {stop.temperaturaAtual} °C</p>
        <p><strong>Percentagem de Ocupação:</strong> {((stop.lotacaoAtual / stop.capacidadeMaxima) * 100).toFixed(2)}%</p>
      </div>

      {/* Mapa da localização */}
      <div className="map-container">
        <MapContainer center={[stop.latitude, stop.longitude]} zoom={16} style={{ height: "300px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[stop.latitude, stop.longitude]}>
            <Popup>{stop.nome}</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Imagem em direto da câmara */}
      <div className="live-camera">
        <h2>Imagem em direto</h2>
        <img src={`http://localhost:8080/cameras/${id}`} alt="Imagem em direto da paragem" />
      </div>
    </div>
  );
};

export default StopDetails;
