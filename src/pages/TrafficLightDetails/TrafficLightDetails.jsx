import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "leaflet/dist/leaflet.css";
import "./TrafficLightDetails.css";

// Component to update map view when coordinates change
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

// New Semaforo component
const Semaforo = ({ estado, position = [0, 0, 0] }) => {
  // Map the API state values to the component's expected values
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
  const [lastUpdate, setLastUpdate] = useState(null);

  // Function to fetch data via HTTP
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

  // Initial data fetch and periodic update setup
  useEffect(() => {
    // Initial data fetch
    fetchTrafficLightData();
    
    // Set up update every second
    const updateInterval = setInterval(() => {
      fetchTrafficLightData();
    }, 1000);
    
    // Cleanup when component unmounts
    return () => {
      clearInterval(updateInterval);
    };
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    // Implement logout logic here
    navigate("/");
  };

  if (!trafficLight) return (
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

  // Determine color class based on current traffic light state
  let statusClass = "";
  let statusText = "";
  
  switch (trafficLight.currentState) {
    case "GREEN":
      statusClass = "green-status";
      statusText = "VERDE";
      break;
    case "YELLOW":
      statusClass = "yellow-status";
      statusText = "AMARELO";
      break;
    case "RED":
      statusClass = "red-status";
      statusText = "VERMELHO";
      break;
    default:
      statusClass = "unknown-status";
      statusText = "DESCONHECIDO";
  }

  return (
    <div className="fullpage-container">
      <header className="header">
        <div className="logo-container">
          <img src="/logo_smart_city.jpg" alt="Logo Smart City" className="smart-city-logo" />
        </div>
        <div className="header-actions">
          <button onClick={handleGoBack} className="btn btn-back">Voltar</button>
          <button onClick={handleLogout} className="btn btn-logout">Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Semáforo ID: {trafficLight.id}</h1>
        </div>
        
        <div className="fullpage-content">
          <div className="left-section">
            <div className="info-card">
              <h2 className="card-title">Informações do Semáforo</h2>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Estado Atual</span>
                  <div className="status-value-container">
                    <span className={`status-value ${statusClass}`}>{statusText}</span>
                  </div>
                </div>
                <div className="status-item">
                  <span className="status-label">Status Operacional</span>
                  <div className="status-value-container">
                    <span className={`status-value ${trafficLight.operational ? "operational-status" : "non-operational-status"}`}>
                      {trafficLight.operational ? "OPERACIONAL" : "NÃO OPERACIONAL"}
                    </span>
                  </div>
                </div>
                <div className="status-item">
                  <span className="status-label">ID</span>
                  <div className="status-value-container">
                    <span className="status-value">{trafficLight.id}</span>
                  </div>
                </div>
                
              </div>
            </div>
            
            <div className="map-card">
              <h2 className="card-title">Localização</h2>
              <div className="map-container">
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
                    <Marker position={[trafficLight.latitude, trafficLight.longitude]}>
                      <Popup>
                        <strong>Semáforo ID: {trafficLight.id}</strong><br />
                        Estado: {statusText}<br />
                        Operacional: {trafficLight.operational ? "Sim" : "Não"}
                      </Popup>
                    </Marker>
                    <MapUpdater center={[trafficLight.latitude, trafficLight.longitude]} />
                  </MapContainer>
                )}
              </div>
            </div>
          </div>

          <div className="right-section">
            <div className="traffic-light-visualization">
              <h2 className="card-title">Visualização do Semáforo</h2>
              <div className="traffic-light-model" style={{ height: "400px", width: "100%" }}>
                <Canvas camera={{ position: [0, 0, 5] }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 10]} intensity={1} />
                  <Semaforo estado={trafficLight.currentState} />
                  <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                </Canvas>
              </div>
              <div className="operational-status-indicator">
                <span className="status-label">Status:</span>
                <span className={`operational-indicator ${trafficLight.operational ? "online" : "offline"}`}>
                  {trafficLight.operational ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Only the time of the last update is maintained */}
      {lastUpdate && (
        <div className="last-update-info">
          Atualizado às: {lastUpdate.toLocaleTimeString('pt-PT')}
        </div>
      )}
    </div>
  );
};

export default TrafficLightDetails;