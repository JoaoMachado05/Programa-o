import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./StopDetails.css";

// Componente para atualizar a view do mapa quando as coordenadas mudarem
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

const StopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stop, setStop] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-PT'));
  const [connectionStatus, setConnectionStatus] = useState("Conectando...");
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Função para buscar dados via HTTP
  const fetchStopData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/stops/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar detalhes da paragem");

      const data = await response.json();
      setStop(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erro ao buscar dados:", error.message);
    }
  };

  // Função para conectar ao WebSocket
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:8080/ws');
      
      ws.onopen = () => {
        console.log('WebSocket conectado');
        setConnectionStatus("Conectado");
        // Subscreve para receber atualizações para este ID de paragem
        ws.send(JSON.stringify({ type: 'subscribe', stopId: id }));
        
        // Limpa qualquer tentativa pendente de reconexão
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Verifica se a mensagem é para esta paragem
          if (data.id === id) {
            setStop(data);
            setLastUpdate(new Date());
          }
        } catch (error) {
          console.error('Erro ao processar mensagem do WebSocket:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('Erro de WebSocket:', error);
        setConnectionStatus("Erro de conexão");
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket fechado. Código:', event.code, 'Razão:', event.reason);
        setConnectionStatus("Usando HTTP (WebSocket desconectado)");
        
        // Tenta reconectar ao WebSocket após 5 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Tentando reconectar WebSocket...');
          connectWebSocket();
        }, 5000);
      };
      
      socketRef.current = ws;
    } catch (error) {
      console.error('Falha ao criar conexão WebSocket:', error);
      setConnectionStatus("Usando HTTP (WebSocket falhou)");
    }
  };

  // Busca dados iniciais e configura a atualização em tempo real
  useEffect(() => {
    // Busca inicial de dados
    fetchStopData();
    
    // Tenta estabelecer conexão WebSocket
    connectWebSocket();
    
    // Configurar atualização a cada segundo, independente do tipo de conexão
    const updateInterval = setInterval(() => {
      fetchStopData(); // Atualiza os dados a cada segundo
      setCameraTimestamp(Date.now()); // Atualiza timestamp da câmera
    }, 1000);
    
    // Atualizações de relógio
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-PT'));
    }, 1000);
    
    // Limpeza ao desmontar o componente
    return () => {
      clearInterval(updateInterval);
      clearInterval(timeInterval);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        // Envia mensagem de unsubscribe antes de fechar
        try {
          socketRef.current.send(JSON.stringify({ type: 'unsubscribe', stopId: id }));
        } catch (e) {
          console.log('Não foi possível enviar unsubscribe');
        }
        
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    // Implementar lógica de logout aqui
    navigate("/");
  };

  // Função para atualizar a imagem da câmera
  const [cameraTimestamp, setCameraTimestamp] = useState(Date.now());

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
          <p className="connection-status">Status: {connectionStatus}</p>
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
            
            <div className="map-card">
              <h2 className="card-title">Localização</h2>
              <div className="map-container">
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
                    <Marker position={[stop.latitude, stop.longitude]}>
                      <Popup>
                        <strong>{stop.nome}</strong><br />
                        Lotação atual: {stop.lotacaoAtual}
                      </Popup>
                    </Marker>
                    <MapUpdater center={[stop.latitude, stop.longitude]} />
                  </MapContainer>
                )}
              </div>
            </div>
          </div>

          <div className="right-section">
            <div className="camera-card">
              <h2 className="card-title">Imagem em Direto</h2>
              <div className="camera-container">
                <img 
                  src={`http://localhost:8080/cameras/${id}?t=${cameraTimestamp}`} 
                  alt="Imagem em direto da paragem" 
                  className="camera-feed"
                />
                <div className="camera-overlay">
                  <div className="camera-info">
                    <div className="camera-details">
                      <span className="camera-label">Em direto</span>
                      <div className="live-indicator">
                        <span className="live-dot"></span>
                        <span>AO VIVO</span>
                      </div>
                    </div>
                    <div className="timestamp">
                      {currentTime}
                    </div>
                  </div>
                </div>
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