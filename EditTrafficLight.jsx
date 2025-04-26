import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './EditTrafficLight.css';

const EditTrafficLightButton = ({ semaforo, onEditTrafficLight }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estado para os campos do formulário
  const [formData, setFormData] = useState({
    id: semaforo.id,
    latitude: semaforo.latitude || '',
    longitude: semaforo.longitude || '',
    operational: semaforo.operational !== undefined ? semaforo.operational : true,
    lastMaintenance: semaforo.lastMaintenance || new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0],
    inAnomaly: semaforo.inAnomaly !== undefined ? semaforo.inAnomaly : false
  });

  // Atualiza formData quando semaforo muda
  useEffect(() => {
    if (semaforo) {
      let formattedLastMaintenance = semaforo.lastMaintenance;
      if (formattedLastMaintenance && !formattedLastMaintenance.includes('T')) {
        formattedLastMaintenance = formattedLastMaintenance.replace(' ', 'T');
      }
      
      setFormData({
        id: semaforo.id,
        latitude: semaforo.latitude || '',
        longitude: semaforo.longitude || '',
        operational: semaforo.operational !== undefined ? semaforo.operational : true,
        lastMaintenance: formattedLastMaintenance || new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0],
        inAnomaly: semaforo.inAnomaly !== undefined ? semaforo.inAnomaly : false
      });
    }
  }, [semaforo]);

  // Controla o scroll do corpo da página quando o modal está aberto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      console.log("Dados enviados:", formData);

      if (typeof onEditTrafficLight !== 'function') {
        console.error('onEditTrafficLight is not a function');
        setErrorMessage('Erro interno de configuração');
        setIsSubmitting(false);
        return;
      }

      const dataToSubmit = {
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        operational: formData.operational,
        lastMaintenance: formData.lastMaintenance,
        inAnomaly: formData.inAnomaly,
        currentState: semaforo.currentState, 
        timeUntilStateChange: semaforo.timeUntilStateChange,
        brtPriorityActive: semaforo.brtPriorityActive,
        priorityBusId: semaforo.priorityBusId,
        stops: semaforo.stops || []
      };

      const result = await Promise.resolve(onEditTrafficLight(semaforo.id, dataToSubmit));

      console.log("Resultado:", result);
      
      if (result && result.success) {
        setSuccessMessage('Semáforo alterado com sucesso!');
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        setErrorMessage((result && result.message) || 'Erro ao editar semáforo');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Erro ao editar semáforo:', error);
      setErrorMessage('Falha na comunicação com o servidor');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        className="edit-button" 
        onClick={openModal} 
        title="Editar semáforo"
      >
        Editar
      </button>

      {isModalOpen && ReactDOM.createPortal(
        <div 
          className="edit-modal-overlay"
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999 // Valor muito alto para garantir que fique na frente
          }}
        >
          <div 
            className="edit-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              zIndex: 10000 // Ainda maior que o overlay
            }}
          >
            <h3>Editar Semáforo</h3>
            
            <div className="semaforo-id-display">
              <strong>ID do Semáforo:</strong> {semaforo.id}
            </div>
            
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="latitude">Latitude*</label>
                  <input 
                    type="number" 
                    step="0.000001"
                    id="latitude" 
                    name="latitude" 
                    value={formData.latitude} 
                    onChange={handleInputChange} 
                    className="form-control"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group form-group-half">
                  <label htmlFor="longitude">Longitude*</label>
                  <input 
                    type="number" 
                    step="0.000001"
                    id="longitude" 
                    name="longitude" 
                    value={formData.longitude} 
                    onChange={handleInputChange} 
                    className="form-control"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastMaintenance">Última Manutenção</label>
                <input 
                  type="datetime-local" 
                  id="lastMaintenance" 
                  name="lastMaintenance" 
                  value={formData.lastMaintenance} 
                  onChange={handleInputChange} 
                  className="form-control"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label htmlFor="operational" className="checkbox-label">
                    <input 
                      type="checkbox" 
                      id="operational" 
                      name="operational" 
                      checked={formData.operational} 
                      onChange={handleInputChange} 
                      disabled={isSubmitting}
                    />
                    <span>Operacional</span>
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label htmlFor="inAnomaly" className="checkbox-label">
                    <input 
                      type="checkbox" 
                      id="inAnomaly" 
                      name="inAnomaly" 
                      checked={formData.inAnomaly} 
                      onChange={handleInputChange} 
                      disabled={isSubmitting}
                    />
                    <span>Em Anomalia</span>
                  </label>
                </div>
              </div>

              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={closeModal} 
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="confirm-edit-button" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default EditTrafficLightButton;