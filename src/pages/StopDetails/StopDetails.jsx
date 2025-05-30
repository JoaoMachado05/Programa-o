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
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -45],
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

// Componente para o alerta sonoro
const SoundAlert = ({ message, isVisible, onClose }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (isVisible && audioRef.current) {
      // Criar um som de alerta usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="sd-sound-alert-overlay">
      <div className="sd-sound-alert">
        <div className="sd-alert-header">
          <span className="sd-alert-icon">🔊</span>
          <h3>Alerta Sonoro</h3>
          <button onClick={onClose} className="sd-alert-close">×</button>
        </div>
        <div className="sd-alert-message">
          {message}
        </div>
      </div>
    </div>
  );
};

const StopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stop, setStop] = useState(null);
  const [nextBus, setNextBus] = useState(null);
  const [buses, setBuses] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-PT'));
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showSoundAlert, setShowSoundAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const updateIntervalRef = useRef(null);

  // Função para buscar dados da paragem via HTTP
  const fetchStopData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/stops/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar detalhes da paragem");

      const data = await response.json();
      
      // Verificar se previousStop é true e mostrar alerta sonoro
      if (data.previousStop && data.message) {
        setAlertMessage(data.message);
        setShowSoundAlert(true);
      }
      
      setStop(data);
      setLastUpdate(new Date());
      
      // Buscar próximo autocarro se nextBusId existir
      if (data.nextBusId) {
        fetchNextBus(data.nextBusId);
      } else {
        setNextBus(null);
      }
    } catch (error) {
      console.error("Erro ao buscar dados da paragem:", error.message);
    }
  };

  // Função para buscar dados do próximo autocarro
  const fetchNextBus = async (busId) => {
    try {
      const response = await fetch(`http://localhost:8080/brts/${busId}`);
      if (!response.ok) throw new Error("Erro ao buscar próximo autocarro");

      const data = await response.json();
      setNextBus(data);
    } catch (error) {
      console.error("Erro ao buscar dados do próximo autocarro:", error.message);
      setNextBus(null);
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

  const handleCloseSoundAlert = () => {
    setShowSoundAlert(false);
  };

  if (!stop) return (
    <div className="sd-fullpage-container">
      <header className="sd-header">
        <div className="sd-logo-container">
          <img src="/logo_TUB.jpg" alt="Logo TUB" className="sd-tub-logo" />
        </div>
        <div className="sd-header-actions">
          <button onClick={handleGoBack} className="sd-btn sd-btn-back">Voltar</button>
          <button onClick={handleLogout} className="sd-btn sd-btn-logout">Logout</button>
        </div>
      </header>
      
      <main className="sd-main-content">
        <div className="sd-loading-container">
          <div className="sd-loader"></div>
          <p className="sd-loading">A carregar informações...</p>
        </div>
      </main>
    </div>
  );

  // Calcular a percentagem de ocupação
  const occupancyPercentage = stop.percentagemOcupacao || 
    ((stop.lotacaoAtual / stop.capacidadeMaxima) * 100).toFixed(1);
  
  // Determinar a classe de cor baseada na ocupação
  let occupancyClass = "sd-low-occupancy";
  if (occupancyPercentage > 75) {
    occupancyClass = "sd-high-occupancy";
  } else if (occupancyPercentage > 50) {
    occupancyClass = "sd-medium-occupancy";
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
    <div className="sd-fullpage-container">
      <header className="sd-header">
        <div className="sd-logo-container">
          <img src="/logo_TUB.jpg" alt="Logo TUB" className="sd-tub-logo" />
        </div>
        <div className="sd-header-actions">
          <button onClick={handleGoBack} className="sd-btn sd-btn-back">Voltar</button>
          <Link to={`/monitorizar-risco?idParagem=${stop.id}`}>
             <button className="sd-btn sd-btn-monitor">Monitorizar Risco ⚠️</button>
          </Link> 
          <button onClick={handleLogout} className="sd-btn sd-btn-logout">Logout</button>
        </div>
      </header>

      <main className="sd-main-content">
        <div className="sd-page-header">
          <h1 className="sd-page-title">{stop.nome}</h1>
        </div>
        
        <div className="sd-fullpage-content">
          <div className="sd-left-section">
            <div className="sd-info-card">
              <h2 className="sd-card-title">Informações da Paragem</h2>
              <div className="sd-status-grid">
                <div className="sd-status-item">
                  <span className="sd-status-label">Lotação Atual</span>
                  <div className="sd-status-value-container">
                    <span className="sd-status-value">{stop.lotacaoAtual}</span>
                    <span className="sd-status-unit">pessoas</span>
                  </div>
                </div>
                <div className="sd-status-item">
                  <span className="sd-status-label">Capacidade Máxima</span>
                  <div className="sd-status-value-container">
                    <span className="sd-status-value">{stop.capacidadeMaxima}</span>
                    <span className="sd-status-unit">pessoas</span>
                  </div>
                </div>
                <div className="sd-status-item">
                  <span className="sd-status-label">Temperatura</span>
                  <div className="sd-status-value-container">
                    <span className="sd-status-value">{stop.temperaturaAtual}</span>
                    <span className="sd-status-unit">°C</span>
                  </div>
                </div>
                <div className="sd-status-item">
                  <span className="sd-status-label">Ocupação</span>
                  <div className={`sd-occupancy-indicator ${occupancyClass}`}>
                    <div 
                      className="sd-occupancy-bar" 
                      style={{width: `${occupancyPercentage}%`}}
                    ></div>
                    <span className="sd-occupancy-text">{occupancyPercentage}%</span>
                  </div>
                </div>
                {stop.estadoOcupacao && (
                  <div className="sd-status-item">
                    <span className="sd-status-label">Estado</span>
                    <div className="sd-status-value-container">
                      <span className="sd-status-value">{stop.estadoOcupacao}</span>
                    </div>
                  </div>
                )}
                {stop.bilhetesValidados !== undefined && (
                  <div className="sd-status-item">
                    <span className="sd-status-label">Bilhetes Validados</span>
                    <div className="sd-status-value-container">
                      <span className="sd-status-value">{stop.bilhetesValidados}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Map card */}
            <div className="sd-map-card">
              <h2 className="sd-card-title">Localização e Autocarros Próximos</h2>
              <div className="sd-map-container">
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
              <div className="sd-map-legend">
                <div className="sd-legend-item">
                  <img src="/BusStopMapIcon.png?v=1" alt="Paragem" className="sd-legend-icon" />
                  <span>Paragem</span>
                </div>
                <div className="sd-legend-item">
                  <img src="/BusMapIcon.png" alt="Autocarro" className="sd-legend-icon" />
                  <span>Autocarro</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sd-right-section">
            {/* Modelo 3D da paragem */}
            <div className="sd-model-card">
              <h2 className="sd-card-title">Modelo 3D da Paragem</h2>
              <div className="sd-model-container">
                <BusStop3D stopId={id} />
                <div className="sd-model-overlay">
                  <div className="sd-model-info">
                    <div className="sd-model-details">
                      <span className="sd-model-label">Modelo Interativo</span>
                    </div>
                    <div className="sd-timestamp">
                      {currentTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Próximo Autocarro */}
            <div className="sd-buses-card">
              <h2 className="sd-card-title">Próximo Autocarro</h2>
              <div className="sd-buses-list">
                {nextBus ? (
                  <div className="sd-bus-item sd-next-bus">
                    <div className="sd-bus-info">
                      <div className="sd-bus-number">#{nextBus.matricula || nextBus.id}</div>
                      <div className="sd-bus-details">
                        <div className="sd-bus-line">
                          {nextBus.linha && nextBus.destino ? 
                            `Linha ${nextBus.linha} → ${nextBus.destino}` : 
                            `Autocarro ID: ${nextBus.id}`
                          }
                        </div>
                        <div className="sd-bus-status">
                          {stop.tempoAteProximoAutocarro ? (
                            <span className="sd-arrival-time">Chega em {stop.tempoAteProximoAutocarro} min</span>
                          ) : (
                            <span className="sd-arrival-time">Tempo não disponível</span>
                          )}
                          <span className="sd-bus-occupancy">
                            Lotação: {nextBus.lotacaoAtual || 0} pessoas
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : stop.nextBusId ? (
                  <div className="sd-loading-bus">
                    <p>A carregar informações do próximo autocarro...</p>
                  </div>
                ) : (
                  <div className="sd-no-buses">
                    <p>Não há próximo autocarro programado.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de autocarros próximos */}
            <div className="sd-buses-card">
              <h2 className="sd-card-title">Autocarros nas Proximidades</h2>
              <div className="sd-buses-list">
                {sortedBuses.length > 0 ? (
                  sortedBuses.map(bus => (
                    <div key={bus.id} className="sd-bus-item">
                      <div className="sd-bus-info">
                        <div className="sd-bus-number">#{bus.matricula || bus.id}</div>
                        <div className="sd-bus-details">
                          <div className="sd-bus-line">
                            {bus.linha && bus.destino ? 
                              `Linha ${bus.linha} → ${bus.destino}` : 
                              `Autocarro ID: ${bus.id}`
                            }
                          </div>
                          <div className="sd-bus-status">
                            {bus.tempoChegada ? (
                              <span className="sd-arrival-time">Chega em {bus.tempoChegada} min</span>
                            ) : (
                              <span className="sd-arrival-time">Em aproximação</span>
                            )}
                            <span className="sd-bus-occupancy">
                              Lotação: {bus.lotacaoAtual || 0} pessoas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sd-no-buses">
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
        <div className="sd-last-update-info">
          Atualizado às: {lastUpdate.toLocaleTimeString('pt-PT')}
        </div>
      )}

      {/* Alerta Sonoro */}
      <SoundAlert 
        message={alertMessage}
        isVisible={showSoundAlert}
        onClose={handleCloseSoundAlert}
      />
    </div>
  );
};

export default StopDetails;