import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddTrafficLight from './AddTrafficLight';
import DeleteTrafficLight from './DeleteTrafficLight';
import EditTrafficLight from './EditTrafficLight';
import './ListaSemaforos.css';

const ListaSemaforos = () => {
  const navigate = useNavigate();
  const [semaforos, setSemaforos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [error, setError] = useState(null);
  const [nextId, setNextId] = useState(1);
  
  const REST_API_URL = 'http://localhost:8080/traffic-lights';

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    
    // Adicionar classe ao body para remover margens ou bordas indesejadas
    document.body.classList.add('no-top-border');
    
    // Cleanup function
    return () => {
      document.body.classList.remove('no-top-border');
    };
  }, []);

  // Calcular o próximo ID disponível
  const calculateNextId = (trafficLights) => {
    if (!trafficLights || trafficLights.length === 0) {
      return 1; // Se não houver semáforos, comece com 1
    }
    
    // Encontre o maior ID atual e adicione 1
    const maxId = Math.max(...trafficLights.map(tl => tl.id));
    return maxId + 1;
  };

  // Fetch data using REST API - Implementa o diagrama "Mostrar lista de semáforos"
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Inserir(id,localização)
      const response = await fetch(REST_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // 2. Buscar(id,localização) -> 3. Devolver(id,localização)
      const data = await response.json();
      
      // 4. Formatar(id,localização)
      const formattedData = data.map(item => ({
        ...item,
        formattedState: formatState(item.currentState),
        formattedOperational: formatOperational(item.operational)
      }));
      
      // 5. Apresentar(id,localização)
      setSemaforos(formattedData);
      setNextId(calculateNextId(data));
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching semáforos data:', err);
      setError('Falha ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new traffic light - Implementa o diagrama "Adicionar semáforo"
  const handleAddTrafficLight = async (trafficLightData) => {
    try {
      // 1. Adicionar(id,localização)
      const response = await fetch(REST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trafficLightData),
      });

      if (!response.ok) {
        // Caso exista na base de dados ou outro erro
        if (response.status === 409) {
          return { success: false, message: "Impossível adicionar semáforo: Já existe na base de dados" };
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Semáforo adicionado com sucesso
      fetchData(); // Recarrega a lista
      return { success: true, message: "semáforo adicionado" };
    } catch (err) {
      console.error('Error adding new traffic light:', err);
      setError('Falha ao adicionar novo semáforo. Por favor, tente novamente.');
      throw err;
    }
  };

  // Function to delete a traffic light - Implementa o diagrama "Remover semáforo"
  const handleDeleteTrafficLight = async (trafficLightId) => {
    try {
      // 1. Inserir(id,localização)
      const response = await fetch(`${REST_API_URL}/${trafficLightId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Dados não encontrados
        if (response.status === 404) {
          return { success: false, message: "Dados errados: Semáforo não encontrado" };
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Semáforo removido com sucesso
      fetchData(); // Recarrega a lista
      return { success: true, message: "semáforo removido" };
    } catch (err) {
      console.error('Error deleting traffic light:', err);
      setError('Falha ao remover semáforo. Por favor, tente novamente.');
      throw err;
    }
  };

  // Function to edit a traffic light - Implementa o diagrama "Editar semáforo"
  const handleEditTrafficLight = async (trafficLightId, trafficLightData) => {
    try {
      // 1. Inserir(id,localização) para buscar primeiro
      const checkResponse = await fetch(`${REST_API_URL}/${trafficLightId}`);
      
      if (!checkResponse.ok) {
        // Dados não encontrados
        if (checkResponse.status === 404) {
          return { success: false, message: "Dados insuficientes: Semáforo não encontrado" };
        }
        throw new Error(`HTTP error! Status: ${checkResponse.status}`);
      }

      // 2. Inserir(id,localização) para atualizar
      const updateResponse = await fetch(`${REST_API_URL}/${trafficLightId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trafficLightData),
      });

      if (!updateResponse.ok) {
        throw new Error(`HTTP error! Status: ${updateResponse.status}`);
      }

      // Semáforo alterado com sucesso
      fetchData(); // Recarrega a lista
      return { success: true, message: "semáforo alterado" };
    } catch (err) {
      console.error('Error editing traffic light:', err);
      setError('Falha ao editar semáforo. Por favor, tente novamente.');
      throw err;
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    fetchData();
  };

  const handleBack = () => {
    navigate('/home');
  };

  // Navigate to semaforo details page
  const handleSemaforoClick = (semaforoId) => {
    console.log("Navegando para o semáforo com ID:", semaforoId);
    navigate(`/traffic-light/${semaforoId}`);
  };

  // Formatação do texto do estado atual
  const formatState = (state) => {
    switch (state) {
      case 'RED':
        return 'Vermelho';
      case 'YELLOW':
        return 'Amarelo';
      case 'GREEN':
        return 'Verde';
      default:
        return 'Desconhecido';
    }
  };

  // Formatação do estado operacional
  const formatOperational = (operational) => {
    return operational ? 'Operacional' : 'Fora de serviço';
  };

  return (
    <div className="semaforos-list-container">
      <div className="semaforos-header">
        <button onClick={handleBack} className="back-button">Voltar</button>
        <h1>Lista de Semáforos</h1>
      </div>

      {/* Adicione o botão de criar semáforo logo abaixo do cabeçalho */}
      <div style={{ width: '90%', maxWidth: '1200px', display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <AddTrafficLight 
          onAddTrafficLight={handleAddTrafficLight} 
          nextId={nextId}
        />
      </div>

      {loading ? (
        <div className="loading-message">Carregando semáforos...</div>
      ) : error ? (
        <div className="error-message">
          {error}
          <button onClick={handleRefresh} className="retry-button">Tentar Novamente</button>
        </div>
      ) : (
        <>
          <div className="semaforos-list">
            {semaforos.length > 0 ? (
              semaforos.map(semaforo => (
                <div 
                  key={semaforo.id} 
                  className={`semaforo-row ${semaforo.operational ? 'operational' : 'non-operational'}`}
                >
                  <div className="semaforo-info">
                    <h3>Semáforo ID: {semaforo.id}</h3>
                    <div className="semaforo-detalhes">
                      <p>
                        <span className="detalhe-label">Estado atual:</span> 
                        <span className={`state-indicator state-${semaforo.currentState.toLowerCase()}`}>
                          {semaforo.formattedState}
                        </span>
                      </p>
                      <p>
                        <span className="detalhe-label">Status:</span> 
                        <span className={`operational-status ${semaforo.operational ? 'status-ok' : 'status-error'}`}>
                          {semaforo.formattedOperational}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="semaforo-actions">
                    <button 
                      className="view-details-button"
                      onClick={() => handleSemaforoClick(semaforo.id)}
                    >
                      Ver Detalhes
                    </button>
                    <EditTrafficLight
                      semaforo={semaforo}
                      onEditTrafficLight={handleEditTrafficLight}
                    />
                    <DeleteTrafficLight
                      semaforoId={semaforo.id}
                      onDeleteTrafficLight={handleDeleteTrafficLight}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">Nenhum semáforo encontrado.</div>
            )}
          </div>

          <div className="bottom-controls">
            <button onClick={handleRefresh} className="refresh-button">
              Atualizar Dados
            </button>
            <span className="last-update">
              Última atualização: {lastUpdated}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ListaSemaforos;