import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './BRT.css';
import AgendarManutencaoBRT from './AgendarManutencaoBRT';
import VisualizarAvariasBRT from './VisualizarAvariasBRT';

import Bus3DModel from './Bus3DModel';

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
  const [lastUpdate, setLastUpdate] = useState(null);
  const updateIntervalRef = useRef(null);
  
  // Estados para controlar os modais
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showIssuesModal, setShowIssuesModal] = useState(false);

  // Função para buscar dados do BRT
  const fetchBRTData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/brts/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verificar e definir valores padrão para campos potencialmente indefinidos
      // Corrigindo a naming convention dos campos para corresponder à API
      const processedData = {
        ...data,
        lotacaoAtual: data.lotacao_atual !== undefined ? data.lotacao_atual : 0,
        capacidadeMaxima: data.capacidade_maxima !== undefined ? data.capacidade_maxima : 0,
        velocidade: data.velocidade !== undefined ? data.velocidade : 0,
        temperaturaAtual: data.temperaturaAtual !== undefined ? data.temperaturaAtual : 0,
        ultimaManutencao: data.ultimaManutencao || "N/A",
      };
      
      // Atualizar os dados do BRT com a hora atual
      setBrtData(processedData);
      setLastUpdate(new Date());
      
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
  
  // Handlers para modais
  const handleOpenMaintenanceModal = () => {
    setShowMaintenanceModal(true);
  };
  
  const handleCloseMaintenanceModal = () => {
    setShowMaintenanceModal(false);
  };
  
  const handleOpenIssuesModal = () => {
    setShowIssuesModal(true);
  };
  
  const handleCloseIssuesModal = () => {
    setShowIssuesModal(false);
  };
  
  const handleMaintenanceSubmit = (dadosManutencao) => {
    console.log("Manutenção agendada:", dadosManutencao);
    setShowMaintenanceModal(false);
  };

  // Helper functions
  const getBusColor = () => {
    return brtData?.linhaAtual ? LINE_COLORS[brtData.linhaAtual] || DEFAULT_COLOR : DEFAULT_COLOR;
  };

  const getStatus = () => {
    return brtData?.velocidade > 0 ? "active" : "inactive";
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-PT');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Componentes de UI condicionais
  if (loading) {
    return (
      <div className="brt-container">
        <header className="brt-header">
          <div className="brt-logo-container">
            <img src="/logo_smart_city.jpg" alt="Logo Smart City" className="brt-logo" />
          </div>
          <div className="brt-header-actions">
            <button onClick={handleVoltar} className="brt-btn brt-btn-back">Voltar</button>
            <button onClick={handleLogout} className="brt-btn brt-btn-logout">Logout</button>
          </div>
        </header>

        <main className="brt-main-content">
          <div className="brt-loading-container">
            <div className="brt-loader"></div>
            <p className="brt-loading">A carregar dados...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!brtData) {
    return (
      <div className="brt-container">
        <header className="brt-header">
          <div className="brt-logo-container">
            <img src="/logo_smart_city.jpg" alt="Logo Smart City" className="brt-logo" />
          </div>
          <div className="brt-header-actions">
            <button onClick={handleVoltar} className="brt-btn brt-btn-back">Voltar</button>
            <button onClick={handleLogout} className="brt-btn brt-btn-logout">Logout</button>
          </div>
        </header>

        <main className="brt-main-content">
          <div className="brt-error-container">
            <p className="brt-error">BRT não encontrado</p>
          </div>
        </main>
      </div>
    );
  }

  const status = getStatus();

  // Renderização do componente principal
  return (
    <div className="brt-container">
      {/* Header com logo e botões */}
      <header className="brt-header">
        <div className="brt-logo-container">
          <img src="/logo_smart_city.jpg" alt="Logo Smart City" className="brt-logo" />
        </div>
        <div className="brt-header-actions">
          <button onClick={handleVoltar} className="brt-btn brt-btn-back">Voltar</button>
          <button onClick={handleLogout} className="brt-btn brt-btn-logout">Logout</button>
        </div>
      </header>

      <main className="brt-main-content">
        <div className="brt-page-title-container">
          <h1 className="brt-page-title">BRT {brtData.matricula || id}</h1>
        </div>
        
        <div className="brt-fullpage-content">
          <div className="brt-left-section">
            <div className="brt-info-card">
              <h2 className="brt-card-title">Informações do Autocarro</h2>
              <div className="brt-status-grid">
                <div className="brt-status-item">
                  <span className="brt-status-label">Matrícula</span>
                  <div className="brt-status-value-container">
                    <span className="brt-status-value">{brtData.matricula || "N/A"}</span>
                  </div>
                </div>
                <div className="brt-status-item">
                  <span className="brt-status-label">Linha</span>
                  <div className="brt-status-value-container">
                    <span className="brt-status-value">{brtData.linhaAtual || "N/A"}</span>
                  </div>
                </div>
                <div className="brt-status-item">
                  <span className="brt-status-label">Velocidade</span>
                  <div className="brt-status-value-container">
                    <span className="brt-status-value">{brtData.velocidade || 0} km/h</span>
                  </div>
                </div>
                <div className="brt-status-item">
                  <span className="brt-status-label">Lotação</span>
                  <div className="brt-status-value-container">
                    <span className="brt-status-value">{brtData.lotacaoAtual || 0}/{brtData.capacidadeMaxima || 0} passageiros</span>
                  </div>
                </div>
                <div className="brt-status-item">
                  <span className="brt-status-label">Temperatura</span>
                  <div className="brt-status-value-container">
                    <span className="brt-status-value">{brtData.temperaturaAtual || 0}°C</span>
                  </div>
                </div>
                <div className="brt-status-item">
                  <span className="brt-status-label">Status</span>
                  <div className="brt-status-value-container">
                    <span className={`brt-status-value brt-status-${status}`}>
                      {status === 'active' ? 'Em movimento' : 'Parado'}
                    </span>
                  </div>
                </div>
                <div className="brt-status-item">
                  <span className="brt-status-label">Última Manutenção</span>
                  <div className="brt-status-value-container">
                    <span className="brt-status-value brt-small-text">
                      {formatDate(brtData.ultimaManutencao)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="brt-map-card">
              <h2 className="brt-card-title">Localização</h2>
              <div className="brt-map-container">
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
                  <Marker position={position} icon={busIcon}>
                    <Popup>
                      BRT {brtData.matricula || "N/A"}<br />
                      Linha: {brtData.linhaAtual || "N/A"}<br />
                      Velocidade: {brtData.velocidade || 0} km/h<br />
                      Lotação: {brtData.lotacaoAtual || 0}/{brtData.capacidadeMaxima || 0}
                    </Popup>
                  </Marker>
                  <MapUpdater center={position} />
                </MapContainer>
              </div>
              
              <div className="brt-map-legend">
                <div className="brt-legend-item">
                  <img src="/BusMapIcon.png" alt="Autocarro" className="brt-legend-icon" style={{ width: '20px', height: '20px' }} />
                  <span>Autocarro</span>
                </div>
              </div>
            </div>
          </div>

          <div className="brt-right-section">
            <div className="brt-bus-visualization">
              <h2 className="brt-card-title">Visualização do Autocarro</h2>
              <div className="brt-bus-model" style={{ height: "400px", width: "100%" }}>
                <Bus3DModel 
                  color={getBusColor()} 
                  speed={brtData.velocidade || 0} 
                />
              </div>
              <div className="brt-operational-status-container">
                <div className="brt-operational-status-indicator">
                  <span className="brt-status-label">Status:</span>
                  <span className={`brt-operational-indicator ${status === 'active' ? "brt-online" : "brt-offline"}`}>
                    {status === 'active' ? "Em operação" : "Parado"}
                  </span>
                </div>
          
                <div className="brt-action-buttons">
                  {/* Botão de Agendar Manutenção */}
                  <button 
                    onClick={handleOpenMaintenanceModal} 
                    className="brt-btn-action brt-btn-agendar-manutencao"
                  >
                    🔧 Agendar Manutenção
                  </button>
                  
                  {/* Botão para Ver Avarias */}
                  <button 
                    onClick={handleOpenIssuesModal} 
                    className="brt-btn-action brt-btn-ver-avarias"
                  >
                    🚨 Ver Avarias
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Informação da última atualização */}
      {lastUpdate && (
        <div className="brt-last-update-info">
          Atualizado às: {lastUpdate.toLocaleTimeString('pt-PT')}
        </div>
      )}

      {/* Modal de Agendamento de Manutenção */}
      {showMaintenanceModal && (
        <AgendarManutencaoBRT 
          isOpen={showMaintenanceModal}
          onClose={handleCloseMaintenanceModal}
          brtId={id}
          onSubmit={handleMaintenanceSubmit}
        />
      )}

      {/* Modal para Visualizar Avarias */}
      {showIssuesModal && (
        <VisualizarAvariasBRT
          isOpen={showIssuesModal}
          onClose={handleCloseIssuesModal}
          brtId={id}
        />
      )}
    </div>
  );
};

export default BRT;