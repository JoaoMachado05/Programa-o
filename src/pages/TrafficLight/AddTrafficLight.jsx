import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddTrafficLight.css';

const TrafficLightModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    currentState: 'GREEN', // Sempre iniciado como verde (oculto do usuário)
    operational: true,
    lastMaintenance: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0],
    timeUntilStateChange: 10, // Sempre 10 (oculto do usuário)
    inAnomaly: false,
    stops: [],
    greenTime: null,
    redTime: null,
    yellowTime: null,
    brtPriorityActive: true, // Sempre ativado (oculto do usuário)
    priorityBusId: null // Mantido no estado mas não exibido na interface
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setProcessing(true);

    // Validação básica
    if (!formData.latitude || !formData.longitude) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setProcessing(false);
      return;
    }

    try {
      // Formatando os dados para o formato esperado pelo backend
      const dataToSubmit = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        currentState: 'GREEN', // Garantindo que o estado seja verde
        timeUntilStateChange: 10, // Garantindo que o tempo seja 10
        brtPriorityActive: true, // Garantindo que a prioridade BRT esteja ativada
        priorityBusId: null, // Definindo como null já que o campo foi removido
        stops: []
      };

      const result = await onSubmit(dataToSubmit);
      
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => onClose(), 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(`Erro ao criar semáforo: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-modal">
        <h3>Adicionar Novo Semáforo</h3>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="add-form">
          <div className="form-row">
            <div className="form-group form-group-half">
              <label htmlFor="latitude">Latitude*</label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="0.000001"
                className="form-control"
                value={formData.latitude}
                onChange={handleChange}
                required
                disabled={processing}
              />
            </div>
            <div className="form-group form-group-half">
              <label htmlFor="longitude">Longitude*</label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="0.000001"
                className="form-control"
                value={formData.longitude}
                onChange={handleChange}
                required
                disabled={processing}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="lastMaintenance">Última Manutenção</label>
            <input
              id="lastMaintenance"
              name="lastMaintenance"
              type="datetime-local"
              className="form-control"
              value={formData.lastMaintenance}
              onChange={handleChange}
              disabled={processing}
            />
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label htmlFor="operational" className="checkbox-label">
                <input
                  id="operational"
                  name="operational"
                  type="checkbox"
                  checked={formData.operational}
                  onChange={handleChange}
                  disabled={processing}
                />
                <span>Operacional</span>
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label htmlFor="inAnomaly" className="checkbox-label">
                <input
                  id="inAnomaly"
                  name="inAnomaly"
                  type="checkbox"
                  checked={formData.inAnomaly}
                  onChange={handleChange}
                  disabled={processing}
                />
                <span>Em Anomalia</span>
              </label>
            </div>
          </div>

          <div className="modal-buttons">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={processing}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="confirm-add-button"
              disabled={processing}
            >
              {processing ? 'Processando...' : 'Criar Semáforo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente botão para adicionar à lista
const AddTrafficLightButton = ({ onAddTrafficLight }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (formData) => {
    return await onAddTrafficLight(formData);
  };

  return (
    <>
      <button 
        onClick={openModal} 
        className="add-button"
      >
        <span className="plus-icon">+</span> Adicionar Semáforo
      </button>
      <TrafficLightModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default AddTrafficLightButton;