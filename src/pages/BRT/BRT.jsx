import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Mapa from '../Mapa/Mapa'; // Caminho correto baseado na estrutura do projeto
import './BRT.css';

const BRT = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brtData, setBrtData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular busca de dados - substitua por sua API real
    const fetchBRTData = async () => {
      try {
        // Substitua esta parte pelo seu endpoint real
        // Ex: const response = await fetch(`/api/brts/${id}`);
        
        // Dados simulados para demonstração
        const mockData = {
          id: id,
          nome: `BRT ${id}`,
          velocidade: "60 km/h",
          lotacao: "45 passageiros",
          temperatura: "24°C",
          status: "active",
          modelo: "Mercedes-Benz O500",
          coordenadas: [38.7223, -9.1393], // Lisboa como exemplo
          ultimaAtualizacao: new Date().toLocaleString()
        };
        
        // Simular atraso na rede
        setTimeout(() => {
          setBrtData(mockData);
          setLoading(false);
        }, 600);
        
      } catch (error) {
        console.error("Erro ao buscar dados do BRT:", error);
        setLoading(false);
      }
    };

    fetchBRTData();
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

  return (
    <div className="brt-container">
      <div className="brt-header">
        <button className="back-button" onClick={handleVoltar}>Voltar</button>
        <h1>{brtData.nome}</h1>
        <div className={`status-indicator ${brtData.status}`}>
          {brtData.status === "active" ? "Ativo" : "Parado"}
        </div>
      </div>

      <div className="brt-info-section">
        <div className="info-panel">
          <h2>Informações:</h2>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Id:</span>
              <span className="info-value">{brtData.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Velocidade:</span>
              <span className="info-value">{brtData.velocidade}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Lotação:</span>
              <span className="info-value">{brtData.lotacao}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Temperatura:</span>
              <span className="info-value">{brtData.temperatura}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="brt-visuals">
        <div className="map-container">
          {/* Integração com o componente Mapa */}
          <Mapa vehiclePosition={brtData.coordenadas} vehicleId={brtData.id} />
        </div>
        
        <div className="model-container">
          <div className="model-placeholder">modelo autocarro</div>
          {/* Integre aqui o modelo 3D ou imagem do autocarro */}
          {/* Ex: <BusModelViewer model={brtData.modelo} /> */}
        </div>
      </div>

      <div className="last-update-info">
        <p>Última atualização: {brtData.ultimaAtualizacao}</p>
      </div>
    </div>
  );
};

export default BRT;