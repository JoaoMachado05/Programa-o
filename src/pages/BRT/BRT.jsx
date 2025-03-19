import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './BRT.css';
import Bus3DModel from './Bus3DModel';

// Correção para os ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BRT = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brtData, setBrtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState([38.7223, -9.1393]); // Posição padrão inicial
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');
  const [lastMessage, setLastMessage] = useState(null);
  const webSocketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(null);

  // Função para conectar ao WebSocket com lógica de reconexão
  const connectWebSocket = () => {
    const wsURL = `ws://localhost:8080/ws/websocket`;
    console.log('Conectando ao WebSocket:', wsURL);
    
    const ws = new WebSocket(wsURL);
    webSocketRef.current = ws;
    
    ws.onopen = () => {
      console.log('Conexão WebSocket estabelecida');
      setConnectionStatus('Conectado');
      
      // Enviar frame CONNECT do STOMP
      try {
        const connectFrame = "CONNECT\naccept-version:1.2\n\n\0";
        ws.send(connectFrame);
        console.log('Frame CONNECT enviado');
      } catch (error) {
        console.error('Erro ao enviar frame CONNECT:', error);
      }
      
      // Aguardar um momento antes de enviar a inscrição
      setTimeout(() => {
        try {
          // Formato STOMP correto para inscrição
          const subscribeMessage = "SUBSCRIBE\n" +
            `destination:/topic/brts/${id}\n` +
            `id:sub-${Date.now()}\n` +
            "\n\0";
          
          console.log('Enviando mensagem de inscrição STOMP:', subscribeMessage);
          ws.send(subscribeMessage);
        } catch (error) {
          console.error('Erro ao enviar mensagem de inscrição:', error);
        }
      }, 500);
      
      // Configurar heartbeat para solicitar atualizações a cada segundo
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          const now = new Date();
          // Verificar se a última atualização foi há mais de 1 segundo
          if (!lastUpdateTimeRef.current || (now - lastUpdateTimeRef.current > 1000)) {
            try {
              // Enviar solicitação de atualização usando formato STOMP
              const requestUpdateMessage = "SEND\n" +
                `destination:/app/request-update/${id}\n` +
                "\n" +
                JSON.stringify({requestType: "position-update", timestamp: now.getTime()}) +
                "\0";
              
              ws.send(requestUpdateMessage);
              console.log("Heartbeat: solicitação de atualização enviada");
            } catch (error) {
              console.error("Erro ao enviar solicitação de heartbeat:", error);
            }
          }
        }
      }, 1000); // Intervalo de 1 segundo para atualização
    };

    ws.onmessage = (event) => {
      console.log('Mensagem WebSocket recebida:', event.data);
      setLastMessage(event.data);
      lastUpdateTimeRef.current = new Date(); // Atualizar timestamp da última mensagem
      
      try {
        // Melhorar a lógica de análise de mensagens
        let data;
        let messageContent = event.data;
        
        // Verificar se é uma mensagem STOMP
        if (typeof messageContent === 'string' && messageContent.startsWith('MESSAGE')) {
          // Extrair o corpo da mensagem STOMP
          const parts = messageContent.split('\n\n');
          if (parts.length > 1) {
            messageContent = parts[1].replace('\0', '');
          }
        }
        
        // Tentar fazer parse do JSON
        try {
          data = JSON.parse(messageContent);
        } catch (e) {
          console.warn('Erro ao parsear mensagem como JSON:', e);
          return; // Sair se não conseguir parsear
        }
        
        // Se temos dados, atualizar o estado
        if (data) {
          console.log('Dados processados:', data);
          
          // Verificar se temos um corpo aninhado
          if (data.body && typeof data.body === 'string') {
            try {
              data = JSON.parse(data.body);
            } catch (e) {
              console.warn('Corpo da mensagem não é JSON válido');
            }
          }
          
          // Atualizar dados do BRT
          setBrtData(prevData => {
            if (!prevData) return data;
            return {
              ...prevData,
              ...data,
              ultimaAtualizacao: new Date().toLocaleString()
            };
          });
          
          // Atualizar posição no mapa se houver novas coordenadas
          if (data.latitude !== undefined && data.longitude !== undefined) {
            setPosition([data.latitude, data.longitude]);
          }
        }
      } catch (error) {
        console.error('Erro ao processar mensagem do WebSocket:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Erro na conexão WebSocket:', error);
      setConnectionStatus('Erro: Falha na conexão');
    };

    ws.onclose = (event) => {
      console.log('Conexão WebSocket fechada:', event.code, event.reason);
      setConnectionStatus(`Desconectado (${event.code})`);
      
      // Limpar o intervalo de heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      // Tentar reconectar após 3 segundos
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    };
  };

  useEffect(() => {
    // Buscar dados iniciais do backend
    const fetchBRTData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/brts/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Dados iniciais recebidos:', data);
        setBrtData(data);
        lastUpdateTimeRef.current = new Date(); // Registrar o momento do carregamento inicial
        
        // Atualizar a posição inicial no mapa usando latitude e longitude
        if (data.latitude && data.longitude) {
          setPosition([data.latitude, data.longitude]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados do BRT:", error);
        setLoading(false);
      }
    };

    fetchBRTData();
    
    // Iniciar a conexão WebSocket
    connectWebSocket();

    // Limpar conexão WebSocket e timeouts quando o componente for desmontado
    return () => {
      console.log('Desmontando componente, limpando recursos');
      
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [id]);

  const handleVoltar = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="brt-container loading">Carregando dados...</div>;
  }

  if (!brtData) {
    return <div className="brt-container error">BRT não encontrado</div>;
  }

  // Determinar o status baseado nos dados disponíveis
  const status = brtData.velocidade > 0 ? "active" : "inactive";
  
  // Determinar a cor do autocarro com base na linha
  const getBusColor = () => {
    const lineColors = {
      'Linha 1': '#1976D2', // Azul
      'Linha 2': '#388E3C', // Verde
      'Linha 3': '#D32F2F', // Vermelho
      // Adicione mais linhas conforme necessário
    };
    
    return lineColors[brtData.linhaAtual] || '#1976D2'; // Cor padrão azul
  };

  // Calcular o tempo desde a última atualização
  const getLastUpdateTime = () => {
    if (!lastUpdateTimeRef.current) return "Nunca";
    const now = new Date();
    const diff = now - lastUpdateTimeRef.current;
    return `${Math.round(diff / 1000)} segundos atrás`;
  };

  return (
    <div className="brt-container">
      <div className="brt-header">
        <button className="back-button" onClick={handleVoltar}>Voltar</button>
        <div className="connection-status">WebSocket: {connectionStatus}</div>
      </div>

      <div className="brt-info-section">
        <div className="info-panel">
          <h2>Informações:</h2>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Matrícula:</span>
              <span className="info-value">{brtData.matricula}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Linha:</span>
              <span className="info-value">{brtData.linhaAtual}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Velocidade:</span>
              <span className="info-value">{brtData.velocidade} km/h</span>
            </div>
            <div className="info-item">
              <span className="info-label">Lotação:</span>
              <span className="info-value">{brtData.lotacaoAtual}/{brtData.capacidadeMaxima} passageiros</span>
            </div>
            <div className="info-item">
              <span className="info-label">Temperatura:</span>
              <span className="info-value">{brtData.temperaturaAtual}°C</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`info-value status-${status}`}>{status === 'active' ? 'Em movimento' : 'Parado'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="brt-visuals">
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
            <Marker position={position}>
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
          {/* Modelo 3D do autocarro */}
          <Bus3DModel 
            color={getBusColor()} 
            speed={brtData.velocidade} 
          />
        </div>
      </div>

      <div className="last-update-info">
        <p>Última atualização: {brtData.ultimaAtualizacao || new Date().toLocaleString()} ({getLastUpdateTime()})</p>
        {lastMessage && (
          <details>
            <summary>Última mensagem WebSocket</summary>
            <pre style={{ fontSize: '12px', maxHeight: '100px', overflow: 'auto' }}>
              {lastMessage}
            </pre>
          </details>
        )}
      </div>
      
      <div className="debug-info">
        <details>
          <summary>Informações de Debug</summary>
          <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <p>Estado da Conexão: {connectionStatus}</p>
            <p>Última Mensagem Recebida: {getLastUpdateTime()}</p>
            <p>Heartbeat Ativo: {heartbeatIntervalRef.current ? 'Sim' : 'Não'}</p>
            <p>Coordenadas Atuais: {position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default BRT;