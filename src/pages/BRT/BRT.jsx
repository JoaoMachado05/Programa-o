import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './BRT.css';
import Bus3DModel from './Bus3DModel';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const BRT = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brtData, setBrtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState([38.7223, -9.1393]); // Default initial position
  const [lastUpdate, setLastUpdate] = useState(null);

  // Function to fetch BRT data via HTTP
  const fetchBRTData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/brts/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      setBrtData(data);
      
      // Update position on map if coordinates are available
      if (data.latitude && data.longitude) {
        setPosition([data.latitude, data.longitude]);
      }
      
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados do BRT:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchBRTData();
    
    // Set up polling interval to fetch data every second
    const updateInterval = setInterval(() => {
      fetchBRTData();
    }, 1000);
    
    // Clean up interval when component unmounts
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

  if (loading) {
    return (
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
  }

  if (!brtData) {
    return (
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
          <div className="error-container">
            <p className="error">BRT não encontrado.</p>
          </div>
        </main>
      </div>
    );
  }

  // Determine status based on available data
  const status = brtData.velocidade > 0 ? "active" : "inactive";
  
  // Determine bus color based on line
  const getBusColor = () => {
    const lineColors = {
      'Linha 1': '#1976D2', // Blue
      'Linha 2': '#388E3C', // Green
      'Linha 3': '#D32F2F', // Red
      // Add more lines as needed
    };
    
    return lineColors[brtData.linhaAtual] || '#1976D2'; // Default blue color
  };

  return (
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
        <div className="page-header">
          <h1 className="page-title">BRT {brtData.matricula}</h1>
        </div>
        
        <div className="brt-content">
          <div className="left-section">
            <div className="info-card">
              <h2 className="card-title">Informações do BRT</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Matrícula</span>
                  <div className="info-value-container">
                    <span className="info-value">{brtData.matricula}</span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Linha</span>
                  <div className="info-value-container">
                    <span className="info-value">{brtData.linhaAtual}</span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <div className="info-value-container">
                    <span className={`info-value status-${status}`}>
                      {status === 'active' ? 'EM MOVIMENTO' : 'PARADO'}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Velocidade</span>
                  <div className="info-value-container">
                    <span className="info-value">{brtData.velocidade} km/h</span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Lotação</span>
                  <div className="info-value-container">
                    <span className="info-value">{brtData.lotacaoAtual}/{brtData.capacidadeMaxima} passageiros</span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Temperatura</span>
                  <div className="info-value-container">
                    <span className="info-value">{brtData.temperaturaAtual}°C</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="map-card">
              <h2 className="card-title">Localização</h2>
              <div className="map-container">
                <MapContainer 
                  center={position} 
                  zoom={13} 
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={position}>
                    <Popup>
                      <strong>BRT {brtData.matricula}</strong><br />
                      Linha: {brtData.linhaAtual}<br />
                      Velocidade: {brtData.velocidade} km/h<br />
                      Lotação: {brtData.lotacaoAtual}/{brtData.capacidadeMaxima}
                    </Popup>
                  </Marker>
                  <MapUpdater center={position} />
                </MapContainer>
              </div>
            </div>
          </div>

          <div className="right-section">
            <div className="bus-visualization">
              <h2 className="card-title">Visualização do BRT</h2>
              <div className="bus-model" style={{ height: "400px", width: "100%" }}>
                <Bus3DModel 
                  color={getBusColor()} 
                  speed={brtData.velocidade} 
                />
              </div>
              <div className="bus-status-indicator">
                <span className="status-label">Status:</span>
                <span className={`status-indicator ${status}`}>
                  {status === 'active' ? 'Em movimento' : 'Parado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Display last update time */}
      {lastUpdate && (
        <div className="last-update-info">
          Atualizado às: {lastUpdate.toLocaleTimeString('pt-PT')}
        </div>
      )}
    </div>
  );
};

export default BRT;