import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./TrafficLightDetails.css";
import AgendarManutencao from "./AgendarManutencao"; // Import do componente de agendamento
import VisualizarAvarias from "./VisualizarAvarias"; // Import do novo componente de avarias

// Component to update map view when coordinates change
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

// Custom icon for the traffic light marker
const trafficLightIcon = new L.Icon({
  iconUrl: "/TrafficLightMapIcon.png",
  iconSize: [40, 40],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Custom icon for buses
const busIcon = new L.Icon({
  iconUrl: '/BusMapIcon.png',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -45]
});

// New Semaforo component
const Semaforo = ({ estado, position = [0, 0, 0] }) => {
  const mapEstadoToComponentFormat = (apiEstado) => {
    switch(apiEstado) {
      case "RED": return "vermelho";
      case "YELLOW": return "amarelo";
      case "GREEN": return "verde";
      default: return "vermelho";
    }
  };

  const mappedEstado = mapEstadoToComponentFormat(estado);

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0, 1, 0.6]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={mappedEstado === "vermelho" ? "red" : "gray"} 
          emissive={mappedEstado === "vermelho" ? "red" : "#330000"}
          emissiveIntensity={mappedEstado === "vermelho" ? 1 : 0.2}
        />
      </mesh>
      <mesh position={[0, 0, 0.6]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={mappedEstado === "amarelo" ? "yellow" : "gray"} 
          emissive={mappedEstado === "amarelo" ? "yellow" : "#333300"}
          emissiveIntensity={mappedEstado === "amarelo" ? 1 : 0.2}
        />
      </mesh>
      <mesh position={[0, -1, 0.6]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={mappedEstado === "verde" ? "green" : "gray"} 
          emissive={mappedEstado === "verde" ? "green" : "#003300"}
          emissiveIntensity={mappedEstado === "verde" ? 1 : 0.2}
        />
      </mesh>
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 5, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
};

const TrafficLightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trafficLight, setTrafficLight] = useState(null);
  const [buses, setBuses] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showAgendarModal, setShowAgendarModal] = useState(false); // Estado para modal de agendamento
  const [showAvariasModal, setShowAvariasModal] = useState(false); // Estado para modal de avarias
  const updateIntervalRef = useRef(null);

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

  // Function to fetch traffic light data via HTTP
  const fetchTrafficLightData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/traffic-lights/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar detalhes do semáforo");

      const data = await response.json();
      setTrafficLight(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erro ao buscar dados:", error.message);
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

  // Initial data fetch and periodic update setup
  useEffect(() => {
    // Initial data fetch
    fetchTrafficLightData();
    fetchBusesData();
    
    // Set up update every second
    updateIntervalRef.current = setInterval(() => {
      fetchTrafficLightData();
      fetchBusesData();
    }, 1000);
    
    // Cleanup when component unmounts
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    // Implement logout logic here
    navigate("/");
  };

  // Abrir modal de agendamento
  const handleOpenAgendarModal = () => {
    setShowAgendarModal(true);
  };

  // Fechar modal de agendamento
  const handleCloseAgendarModal = () => {
    setShowAgendarModal(false);
  };

  // Abrir modal de avarias
  const handleOpenAvariasModal = () => {
    setShowAvariasModal(true);
  };

  // Fechar modal de avarias
  const handleCloseAvariasModal = () => {
    setShowAvariasModal(false);
  };

  // Processar submissão do formulário de agendamento
  const handleAgendarSubmit = (dadosManutencao) => {
    console.log("Manutenção agendada:", dadosManutencao);
    // Aqui você pode adicionar lógica adicional como atualizar informações
    setShowAgendarModal(false); // Fechar o modal após envio
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-PT');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  if (!trafficLight) return (
    <div className="traffic-light-details-container">
      <header className="traffic-light-details-header">
        <div className="traffic-light-details-logo-container">
          <img src="/logo_TUB.jpg" alt="Logo TUB" className="traffic-light-details-logo" />
        </div>
        <div className="traffic-light-details-header-actions">
          <button onClick={handleGoBack} className="traffic-light-details-btn traffic-light-details-btn-back">Voltar</button>
          <button onClick={handleLogout} className="traffic-light-details-btn traffic-light-details-btn-logout">Logout</button>
        </div>
      </header>
      
      <main className="traffic-light-details-main-content">
        <div className="traffic-light-details-loading-container">
          <div className="traffic-light-details-loader"></div>
          <p className="traffic-light-details-loading">A carregar informações...</p>
        </div>
      </main>
    </div>
  );

  // Determine color class based on current traffic light state
  let statusClass = "";
  let statusText = "";
  
  switch (trafficLight.currentState) {
    case "GREEN":
      statusClass = "traffic-light-details-green-status";
      statusText = "VERDE";
      break;
    case "YELLOW":
      statusClass = "traffic-light-details-yellow-status";
      statusText = "AMARELO";
      break;
    case "RED":
      statusClass = "traffic-light-details-red-status";
      statusText = "VERMELHO";
      break;
    default:
      statusClass = "traffic-light-details-red-status";
      statusText = "DESCONHECIDO";
  }

  // Filtrar autocarros que estão próximos ao semáforo (até 1km de distância)
  const nearbyBuses = buses.filter(bus => {
    if (!bus.latitude || !bus.longitude || !trafficLight.latitude || !trafficLight.longitude) return false;
    const distance = calculateDistance(
      trafficLight.latitude, 
      trafficLight.longitude, 
      bus.latitude, 
      bus.longitude
    );
    return distance <= 1; // Distância máxima de 1km
  });

  // Estimar tempo de chegada baseado na distância (valor aproximado)
  const busesWithArrivalTime = nearbyBuses.map(bus => {
    const distance = calculateDistance(
      trafficLight.latitude, 
      trafficLight.longitude, 
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

  return (
    <div className="traffic-light-details-container">
      <header className="traffic-light-details-header">
        <div className="traffic-light-details-logo-container">
          <img src="/logo_smart_city.jpg" alt="Logo Smart City" className="traffic-light-details-logo" />
        </div>
        <div className="traffic-light-details-header-actions">
          <button onClick={handleGoBack} className="traffic-light-details-btn traffic-light-details-btn-back">Voltar</button>
          <button onClick={handleLogout} className="traffic-light-details-btn traffic-light-details-btn-logout">Logout</button>
        </div>
      </header>

      <main className="traffic-light-details-main-content">
        <div className="traffic-light-details-page-title-container">
          <h1 className="traffic-light-details-page-title">Semáforo ID: {trafficLight.id}</h1>
        </div>
        
        <div className="traffic-light-details-fullpage-content">
          <div className="traffic-light-details-left-section">
            <div className="traffic-light-details-info-card">
              <h2 className="traffic-light-details-card-title">Informações do Semáforo</h2>
              <div className="traffic-light-details-status-grid">
                <div className="traffic-light-details-status-item">
                  <span className="traffic-light-details-status-label">Estado Atual</span>
                  <div className="traffic-light-details-status-value-container">
                    <span className={`traffic-light-details-status-value ${statusClass}`}>{statusText}</span>
                  </div>
                </div>
                <div className="traffic-light-details-status-item">
                  <span className="traffic-light-details-status-label">Status Operacional</span>
                  <div className="traffic-light-details-status-value-container">
                    <span className={`traffic-light-details-status-value ${trafficLight.operational ? "traffic-light-details-operational-status" : "traffic-light-details-non-operational-status"}`}>
                      {trafficLight.operational ? "OPERACIONAL" : "NÃO OPERACIONAL"}
                    </span>
                  </div>
                </div>
                <div className="traffic-light-details-status-item">
                  <span className="traffic-light-details-status-label">ID</span>
                  <div className="traffic-light-details-status-value-container">
                    <span className="traffic-light-details-status-value">{trafficLight.id}</span>
                  </div>
                </div>
                <div className="traffic-light-details-status-item">
                  <span className="traffic-light-details-status-label">Última Manutenção</span>
                  <div className="traffic-light-details-status-value-container">
                    <span className="traffic-light-details-status-value traffic-light-details-small-text">
                      {formatDate(trafficLight.lastMaintenance)}
                    </span>
                  </div>
                </div>
                
              </div>
            </div>
            
            <div className="traffic-light-details-map-card">
              <h2 className="traffic-light-details-card-title">Localização e Autocarros Próximos</h2>
              <div className="traffic-light-details-map-container">
                {trafficLight.latitude && trafficLight.longitude && (
                  <MapContainer 
                    center={[trafficLight.latitude, trafficLight.longitude]} 
                    zoom={15} 
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Marcador do semáforo */}
                    <Marker 
                      position={[trafficLight.latitude, trafficLight.longitude]}
                      icon={trafficLightIcon}
                    >
                      <Popup>
                        <strong>Semáforo ID: {trafficLight.id}</strong><br />
                        Estado: {statusText}<br />
                        Operacional: {trafficLight.operational ? "Sim" : "Não"}
                      </Popup>
                    </Marker>
                    
                    {/* Marcadores dos autocarros próximos */}
                    {busesWithArrivalTime.map(bus => (
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
                    
                    <MapUpdater center={[trafficLight.latitude, trafficLight.longitude]} />
                  </MapContainer>
                )}
              </div>
              
              {/* Legenda dos ícones do mapa */}
              <div className="traffic-light-details-map-legend">
                <div className="traffic-light-details-legend-item">
                  <img src="/TrafficLightMapIcon.png" alt="Semáforo" className="traffic-light-details-legend-icon" style={{ width: '20px', height: '20px' }} />
                  <span>Semáforo</span>
                </div>
                <div className="traffic-light-details-legend-item">
                  <img src="/BusMapIcon.png" alt="Autocarro" className="traffic-light-details-legend-icon" style={{ width: '20px', height: '20px' }} />
                  <span>Autocarro</span>
                </div>
              </div>
            </div>
            
            {/* A seção de lista de autocarros próximos foi removida */}
          </div>

          <div className="traffic-light-details-right-section">
            <div className="traffic-light-details-traffic-light-visualization">
              <h2 className="traffic-light-details-card-title">Visualização do Semáforo</h2>
              <div className="traffic-light-details-traffic-light-model" style={{ height: "400px", width: "100%" }}>
                <Canvas camera={{ position: [0, 0, 5] }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 10]} intensity={1} />
                  <Semaforo estado={trafficLight.currentState} />
                  <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                </Canvas>
              </div>
              <div className="traffic-light-details-state-timer">
                <span className="traffic-light-details-state-timer-label">Próxima mudança em:</span>
                <span className="traffic-light-details-state-timer-value">{trafficLight.timeUntilStateChange}s</span>
              </div>
              <div className="traffic-light-details-operational-status-container">
                <div className="traffic-light-details-operational-status-indicator">
                  <span className="traffic-light-details-status-label">Status:</span>
                  <span className={`traffic-light-details-operational-indicator ${trafficLight.operational ? "traffic-light-details-online" : "traffic-light-details-offline"}`}>
                    {trafficLight.operational ? "Online" : "Offline"}
                  </span>
                </div>
                
                <div className="traffic-light-details-action-buttons">
                  {/* Botão de Agendar Manutenção */}
                  <button 
                    onClick={handleOpenAgendarModal} 
                    className="traffic-light-details-btn-action traffic-light-details-btn-agendar-manutencao"
                  >
                    🔧 Agendar Manutenção
                  </button>
                  
                  {/* Botão para Ver Avarias */}
                  <button 
                    onClick={handleOpenAvariasModal} 
                    className="traffic-light-details-btn-action traffic-light-details-btn-ver-avarias"
                  >
                    🚨 Ver Avarias
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Only the time of the last update is maintained */}
      {lastUpdate && (
        <div className="traffic-light-details-last-update-info">
          Atualizado às: {lastUpdate.toLocaleTimeString('pt-PT')}
        </div>
      )}

      {/* Modal de Agendamento de Manutenção */}
      {showAgendarModal && (
        <AgendarManutencao 
          isOpen={showAgendarModal}
          onClose={handleCloseAgendarModal}
          trafficLightId={trafficLight.id}
          onSubmit={handleAgendarSubmit}
        />
      )}

      {/* Modal de Visualização de Avarias */}
      {showAvariasModal && (
        <VisualizarAvarias
          isOpen={showAvariasModal}
          onClose={handleCloseAvariasModal}
          trafficLightId={trafficLight.id}
        />
      )}
    </div>
  );
};

export default TrafficLightDetails;