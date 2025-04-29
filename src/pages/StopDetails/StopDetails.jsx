import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./StopDetails.css";
import BusStop3D from "./BusStop3D.jsx"; 
import { Link } from "react-router-dom";



// Correção para os ícones do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Criando o ícone personalizado para paradas de ônibus
const busStopIcon = new L.Icon({
  iconUrl: '/BusStopMapIcon.png?v=1',
  iconSize: [60, 60], 
  iconAnchor: [30, 60], 
  popupAnchor: [0, -50], 
});

// Criando o ícone personalizado para autocarros
const busIcon = new L.Icon({
  iconUrl: '/BusMapIcon.png',
  iconSize: [50, 50], // Aumentei de 35x35 para 50x50
  iconAnchor: [25, 50], // Ajustei para manter o ponto de ancoragem correto
  popupAnchor: [0, -45], // Ajustei para o popup ficar bem posicionado
});


// Solução de fallback para ícones padrão do Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente modificado para não recentrar quando o usuário interage com o mapa
const MapUpdater = ({ center }) => {
  const map = useMap();
  const [userInteracted, setUserInteracted] = useState(false);
  
  useEffect(() => {
    // Apenas fazemos o setView na primeira renderização ou se o usuário não interagiu
    if (center && !userInteracted) {
      map.setView(center, map.getZoom());
    }
    
    // Adicionamos listeners para detectar interação do usuário
    const handleUserInteraction = () => {
      setUserInteracted(true);
    };
    
    map.on('drag', handleUserInteraction);
    map.on('zoom', handleUserInteraction);
    
    return () => {
      map.off('drag', handleUserInteraction);
      map.off('zoom', handleUserInteraction);
    };
  }, [center, map, userInteracted]);
  
  return null;
};

const StopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stop, setStop] = useState(null);
  const [buses, setBuses] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-PT'));
  const [lastUpdate, setLastUpdate] = useState(null);
  const updateIntervalRef = useRef(null);

  // Função para buscar dados da paragem via HTTP
  const fetchStopData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/stops/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar detalhes da paragem");

      const data = await response.json();
      setStop(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erro ao buscar dados da paragem:", error.message);
    }
  };

  // Função para buscar dados dos autocarros
  const fetchBusesData = async () => {
    try {
      // Usando o endpoint /brts conforme o controlador fornecido
      const response = await fetch(`http://localhost:8080/brts`);
      if (!response.ok) throw new Error("Erro ao buscar autocarros");

      const data = await response.json();
      setBuses(data);
    } catch (error) {
      console.error("Erro ao buscar dados dos autocarros:", error.message);
    }
  };

  // Calcular distância entre dois pontos geográficos (usando fórmula de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distância em km
    return distance;
  };

  // Busca dados iniciais e configura a atualização em tempo real
  useEffect(() => {
    // Busca inicial de dados
    fetchStopData();
    fetchBusesData();
    
    // Configurar atualização a cada segundo via polling
    updateIntervalRef.current = setInterval(() => {
      fetchStopData();
      fetchBusesData();
    }, 1000);
    
    // Atualizações de relógio
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-PT'));
    }, 1000);
    
    // Limpeza ao desmontar o componente
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      clearInterval(timeInterval);
    };
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    // Implementar lógica de logout aqui
    navigate("/");
  };

  if (!stop) return (
    <div className="fullpage-container">
      <header className="header">
        <div className="logo-container">
          <img src="/logo_TUB.jpg" alt="Logo TUB" className="tub-logo" />
        </div>
        <div className="header-actions">
          <button onClick={handleGoBack} className="btn btn-back">Voltar</button>
          <button onClick={handleLogout} className="btn btn-logout">Logout</button>
        </div>
      </header>
      
      <main className="main-content">
        <div className="loading-container">
          <div className="loader"></div>
          <p className="loading">A carregar informações...</p>
        </div>
      </main>
    </div>
  );

  // Calcular a percentagem de ocupação
  const occupancyPercentage = ((stop.lotacaoAtual / stop.capacidadeMaxima) * 100).toFixed(1);
  
  // Determinar a classe de cor baseada na ocupação
  let occupancyClass = "low-occupancy";
  if (occupancyPercentage > 75) {
    occupancyClass = "high-occupancy";
  } else if (occupancyPercentage > 50) {
    occupancyClass = "medium-occupancy";
  }

  // Filtrar autocarros que estão próximos à paragem (até 1km de distância)
  const nearbyBuses = buses.filter(bus => {
    if (!bus.latitude || !bus.longitude) return false;
    const distance = calculateDistance(
      stop.latitude, 
      stop.longitude, 
      bus.latitude, 
      bus.longitude
    );
    return distance <= 1; // Distância máxima de 1km
  });

  // Estimar tempo de chegada baseado na distância (valor aproximado)
  const busesWithArrivalTime = nearbyBuses.map(bus => {
    const distance = calculateDistance(
      stop.latitude, 
      stop.longitude, 
      bus.latitude, 
      bus.longitude
    );
    // Velocidade média estimada: 20 km/h (0.33 km/min)
    const estimatedTimeMin = Math.round(distance / 0.33);
    return {
      ...bus,
      tempoChegada: estimatedTimeMin > 0 ? estimatedTimeMin : null
    };
  });

  // Ordenar autocarros por tempo de chegada
  const sortedBuses = busesWithArrivalTime.sort((a, b) => {
    if (a.tempoChegada === null) return 1;
    if (b.tempoChegada === null) return -1;
    return a.tempoChegada - b.tempoChegada;
  });

  return (
    <div className="fullpage-container">
      <header className="header">
        <div className="logo-container">
          <img src="/logo_TUB.jpg" alt="Logo TUB" className="tub-logo" />
        </div>
        <div className="header-actions">
          <button onClick={handleGoBack} className="btn btn-back">Voltar</button>
          <Link to={`/monitorizar-risco?idParagem=${stop.id}`}>
             <button className="btn btn-monitor">Monitorizar Risco ⚠️</button>
          </Link> 
          <button onClick={handleLogout} className="btn btn-logout">Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">{stop.nome}</h1>
        </div>
        
        <div className="fullpage-content">
          <div className="left-section">
            <div className="info-card">
              <h2 className="card-title">Informações da Paragem</h2>
              <div className="status-grid">
              

                <div className="status-item">
                  <span className="status-label">Lotação Atual</span>
                  <div className="status-value-container">
                    <span className="status-value">{stop.lotacaoAtual}</span>
                    <span className="status-unit">pessoas</span>
                  </div>
                </div>
                <div className="status-item">
                  <span className="status-label">Capacidade Máxima</span>
                  <div className="status-value-container">
                    <span className="status-value">{stop.capacidadeMaxima}</span>
                    <span className="status-unit">pessoas</span>
                  </div>
                </div>
                <div className="status-item">
                  <span className="status-label">Temperatura</span>
                  <div className="status-value-container">
                    <span className="status-value">{stop.temperaturaAtual}</span>
                    <span className="status-unit">°C</span>
                  </div>
                </div>
                <div className="status-item">
                  <span className="status-label">Ocupação</span>
                  <div className={`occupancy-indicator ${occupancyClass}`}>
                    <div 
                      className="occupancy-bar" 
                      style={{width: `${occupancyPercentage}%`}}
                    ></div>
                    <span className="occupancy-text">{occupancyPercentage}%</span>
                  </div>
                </div>
          
              </div>
            </div>
            
            {/* Map card expandido até o modelo 3D */}
            <div className="map-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h2 className="card-title">Localização e Autocarros Próximos</h2>
              <div className="map-container" style={{ flex: 1, height: '100%', width: '100%', minHeight: '400px', position: 'relative' }}>
                {stop.latitude && stop.longitude && (
                  <MapContainer 
                    center={[stop.latitude, stop.longitude]} 
                    zoom={15} 
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Marcador da paragem de autocarro */}
                    <Marker 
                      position={[stop.latitude, stop.longitude]} 
                      icon={busStopIcon}
                    >
                      <Popup>
                        <strong>{stop.nome}</strong><br />
                        Lotação atual: {stop.lotacaoAtual} pessoas<br />
                        Temperatura: {stop.temperaturaAtual}°C
                      </Popup>
                    </Marker>
                    
                    {/* Marcadores dos autocarros */}
                    {sortedBuses.map(bus => (
                      <Marker 
                        key={bus.id}
                        position={[bus.latitude, bus.longitude]} 
                        icon={busIcon}
                      >
                        <Popup>
                          <strong>Autocarro {bus.matricula || bus.id}</strong><br />
                          {bus.linha && <div>Linha: {bus.linha}<br /></div>}
                          {bus.destino && <div>Destino: {bus.destino}<br /></div>}
                          Lotação: {bus.lotacaoAtual || 0} pessoas<br />
                          {bus.tempoChegada && (
                            <>Chegada prevista: {bus.tempoChegada} min</>
                          )}
                        </Popup>
                      </Marker>
                    ))}
                    
                    <MapUpdater center={[stop.latitude, stop.longitude]} />
                  </MapContainer>
                )}
              </div>
              {/* Legenda dos ícones do mapa */}
              <div className="map-legend">
                <div className="legend-item">
                  <img src="/BusStopMapIcon.png?v=1" alt="Paragem" className="legend-icon" style={{ width: '20px', height: '20px' }} />
                  <span>Paragem</span>
                </div>
                <div className="legend-item">
                  <img src="/BusMapIcon.png" alt="Autocarro" className="legend-icon" style={{ width: '20px', height: '20px' }} />
                  <span>Autocarro</span>
                </div>
              </div>
            </div>
          </div>

          <div className="right-section">
            {/* Modelo 3D da paragem */}
            <div className="model-card">
              <h2 className="card-title">Modelo 3D da Paragem</h2>
              <div className="model-container" style={{ height: "400px", width: "100%" }}>
               <BusStop3D stopId={id} />
                <div className="model-overlay">
                  <div className="model-info">
                    <div className="model-details">
                      <span className="model-label">Modelo Interativo</span>
                    </div>
                    <div className="timestamp">
                      {currentTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lista de autocarros próximos */}
            <div className="buses-card">
              <h2 className="card-title">Autocarros a Caminho</h2>
              <div className="buses-list">
                {sortedBuses.length > 0 ? (
                  sortedBuses.map(bus => (
                    <div key={bus.id} className="bus-item">
                      <div className="bus-info">
                        <div className="bus-number">#{bus.matricula || bus.id}</div>
                        <div className="bus-details">
                          <div className="bus-line">
                            {bus.linha && bus.destino ? 
                              `Linha ${bus.linha} → ${bus.destino}` : 
                              `Autocarro ID: ${bus.id}`
                            }
                          </div>
                          <div className="bus-status">
                            {bus.tempoChegada ? (
                              <span className="arrival-time">Chega em {bus.tempoChegada} min</span>
                            ) : (
                              <span className="arrival-time">Em aproximação</span>
                            )}
                            <span className="bus-occupancy">
                              Lotação: {bus.lotacaoAtual || 0} pessoas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-buses">
                    <p>Não há autocarros nas proximidades.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Informação de última atualização no canto inferior direito */}
      {lastUpdate && (
        <div className="last-update-info">
          Atualizado às: {lastUpdate.toLocaleTimeString('pt-PT')}
        </div>
      )}
    </div>
  );
};

export default StopDetails;
