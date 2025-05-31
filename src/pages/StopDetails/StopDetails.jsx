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

// Componente para a notificação no canto da tela
const ToastNotification = ({ message, isVisible, onClose }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      // Criar um som de alerta usando Web Audio API
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Audio context não disponível');
      }

      // Auto-fechar após 5 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="sd-toast-notification">
      <div className="sd-toast-content">
        <div className="sd-toast-icon">🚌</div>
        <div className="sd-toast-message">{message}</div>
        <button onClick={onClose} className="sd-toast-close">×</button>
      </div>
    </div>
  );
};

const StopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stop, setStop] = useState(null);
  const [nextBus, setNextBus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-PT'));
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showToastNotification, setShowToastNotification] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [lastAlertTime, setLastAlertTime] = useState(null); // Controla quando foi mostrado o último alerta
  const updateIntervalRef = useRef(null);

  // Função para buscar dados da paragem via HTTP
  const fetchStopData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/stops/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar detalhes da paragem");

      const data = await response.json();
      
      // Verificar se previousStop é true e se já passaram 15 segundos desde o último alerta
      if (data.previousStop && data.message) {
        const currentTime = Date.now();
        
        // Se nunca mostrou alerta ou se passaram pelo menos 15 segundos (15000ms)
        if (!lastAlertTime || (currentTime - lastAlertTime) >= 15000) {
          setAlertMessage(data.message);
          setShowToastNotification(true);
          setLastAlertTime(currentTime);
        }
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

  // Busca dados iniciais e configura a atualização em tempo real
  useEffect(() => {
    // Busca inicial de dados
    fetchStopData();
    
    // Configurar atualização a cada segundo via polling
    updateIntervalRef.current = setInterval(() => {
      fetchStopData();
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

  const handleCloseToastNotification = () => {
    setShowToastNotification(false);
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

  return (
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
                    <span className="sd-status-label">Estado Ocupação</span>
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
              <h2 className="sd-card-title">Localização e Próximo Autocarro</h2>
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
                    
                    {/* Marcador do próximo autocarro (apenas se tiver coordenadas) */}
                    {nextBus && nextBus.latitude && nextBus.longitude && (
                      <Marker 
                        position={[nextBus.latitude, nextBus.longitude]} 
                        icon={busIcon}
                      >
                        <Popup>
                          <strong>Próximo Autocarro {nextBus.matricula || nextBus.id}</strong><br />
                          {nextBus.linha && <div>Linha: {nextBus.linha}<br /></div>}
                          {nextBus.destino && <div>Destino: {nextBus.destino}<br /></div>}
                          Lotação: {nextBus.lotacaoAtual || 0} pessoas<br />
                          {stop.tempoAteProximoAutocarro && (
                            <>Chegada prevista: {stop.tempoAteProximoAutocarro} min</>
                          )}
                        </Popup>
                      </Marker>
                    )}
                    
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
                  <img src="/BusMapIcon.png" alt="Próximo Autocarro" className="sd-legend-icon" />
                  <span>Próximo Autocarro</span>
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
          </div>
        </div>
      </main>
      
      {/* Informação de última atualização no canto inferior direito */}
      {lastUpdate && (
        <div className="sd-last-update-info">
          Atualizado às: {lastUpdate.toLocaleTimeString('pt-PT')}
        </div>
      )}

      {/* Notificação Toast */}
      <ToastNotification 
        message={alertMessage}
        isVisible={showToastNotification}
        onClose={handleCloseToastNotification}
      />
    </div>
  );
};

export default StopDetails;