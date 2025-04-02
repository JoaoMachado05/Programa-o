import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './BRT.css';
import Bus3DModel from './Bus3DModel';

const busIcon = new L.Icon({
  iconUrl: '/BusMapIcon.png',
  iconSize: [50, 50], 
  iconAnchor: [25, 50], 
  popupAnchor: [0, -45], 
});

// Constantes e configurações
const DEFAULT_POSITION = [38.7223, -9.1393];
const LINE_COLORS = {
  'Linha 1': '#1976D2', // Azul
  'Linha 2': '#388E3C', // Verde
  'Linha 3': '#D32F2F', // Vermelho
};
const DEFAULT_COLOR = '#1976D2';
const UPDATE_INTERVAL = 1000; // Intervalo de atualização em milissegundos (1 segundo)

const BRT = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brtData, setBrtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const updateIntervalRef = useRef(null);

  // Função para buscar dados do BRT
  const fetchBRTData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/brts/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Atualizar os dados do BRT com a hora atual
      setBrtData({
        ...data,
        ultimaAtualizacao: new Date().toLocaleString()
      });
      
      // Atualizar a posição no mapa se houver coordenadas
      if (data.latitude && data.longitude) {
        setPosition([data.latitude, data.longitude]);
      }
      
      if (loading) {
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do BRT:", error);
      if (loading) {
        setLoading(false);
      }
    }
  };

  // Fetch inicial e configuração do intervalo de atualização
  useEffect(() => {
    // Primeiro fetch ao montar o componente
    fetchBRTData();
    
    // Configurar intervalo para atualização a cada segundo
    updateIntervalRef.current = setInterval(fetchBRTData, UPDATE_INTERVAL);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [id]); // Executar novamente se o ID mudar

  // Handlers
  const handleVoltar = () => navigate(-1);
  const handleLogout = () => {
    console.log("Logout acionado");
    navigate('/login');
  };

  // Helper functions
  const getBusColor = () => {
    return brtData?.linhaAtual ? LINE_COLORS[brtData.linhaAtual] || DEFAULT_COLOR : DEFAULT_COLOR;
  };

  const getStatus = () => {
    return brtData?.velocidade > 0 ? "active" : "inactive";
  };

  // Componentes de UI condicionais
  if (loading) {
    return <div className="brt-container loading">Carregando dados...</div>;
  }

  if (!brtData) {
    return <div className="brt-container error">BRT não encontrado</div>;
  }

  const status = getStatus();

  // Renderização do componente principal
  return (
    <div className="brt-container">
      {/* Header com botões agrupados à direita */}
      <header className="brt-header">
        <h1>BRT {brtData.matricula}</h1>
        <div className="nav-buttons">
          <button className="back-button" onClick={handleVoltar}>Voltar</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Informações do BRT */}
      <section className="brt-info-section">
        <div className="info-panel">
          <h2>Informações:</h2>
          <div className="info-list">
            <InfoItem label="Matrícula" value={brtData.matricula} />
            <InfoItem label="Linha" value={brtData.linhaAtual} />
            <InfoItem label="Velocidade" value={`${brtData.velocidade} km/h`} />
            <InfoItem 
              label="Lotação" 
              value={`${brtData.lotacaoAtual}/${brtData.capacidadeMaxima} passageiros`} 
            />
            <InfoItem label="Temperatura" value={`${brtData.temperaturaAtual}°C`} />
            <InfoItem 
              label="Status" 
              value={status === 'active' ? 'Em movimento' : 'Parado'} 
              className={`info-value status-${status}`} 
            />
          </div>
        </div>
      </section>

      {/* Visualizações (Mapa e Modelo 3D) */}
      <section className="brt-visuals">
        <div className="map-container">
          <MapContainer 
            center={position} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position} icon={busIcon}>
              <Popup>
                BRT {brtData.matricula}<br />
                Linha: {brtData.linhaAtual}<br />
                Velocidade: {brtData.velocidade} km/h<br />
                Lotação: {brtData.lotacaoAtual}/{brtData.capacidadeMaxima}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        <div className="model-container">
          <Bus3DModel 
            color={getBusColor()} 
            speed={brtData.velocidade} 
          />
        </div>
      </section>

      {/* Footer com informação de atualização */}
      <footer className="last-update-info">
        <p>Última atualização: {brtData.ultimaAtualizacao}</p>
      </footer>
    </div>
  );
};

// Componente auxiliar para itens de informação
const InfoItem = ({ label, value, className = "info-value" }) => (
  <div className="info-item">
    <span className="info-label">{label}:</span>
    <span className={className}>{value}</span>
  </div>
);

export default BRT;