import React, { useState } from 'react';
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
    operational: semaforo.operational
  });

  // Abre o modal de edição
  const openModal = () => {
    // Reinicia os dados do formulário com os valores atuais do semáforo
    setFormData({
      id: semaforo.id,
      latitude: semaforo.latitude || '',
      longitude: semaforo.longitude || '',
      operational: semaforo.operational
    });
    setIsModalOpen(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    // Add event listener to prevent body scrolling
    document.body.style.overflow = 'hidden';
  };

  // Fecha o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setErrorMessage('');
    setSuccessMessage('');
    
    // Restore body scrolling
    document.body.style.overflow = '';
  };

  // Atualiza o estado do formulário quando os inputs mudam
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Implementa a lógica de edição
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Para debug, verificar os dados enviados
      console.log("Dados enviados:", formData);

      // Verifica se a função onEditTrafficLight existe
      if (typeof onEditTrafficLight !== 'function') {
        console.error('onEditTrafficLight is not a function');
        setErrorMessage('Erro interno de configuração');
        return;
      }

      // Chama a função de editar do componente pai
      const result = await onEditTrafficLight(semaforo.id, {
        latitude: formData.latitude,
        longitude: formData.longitude,
        operational: formData.operational
      });

      // Para debug, verificar o resultado
      console.log("Resultado:", result);
      
      // Verifica o resultado 
      if (result && result.success) {
        // Caso de sucesso: "semáforo alterado"
        setSuccessMessage('Semáforo alterado com sucesso!');
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        // Caso de erro
        setErrorMessage((result && result.message) || 'Erro ao editar semáforo');
      }
    } catch (error) {
      // Erro genérico no processo de edição
      console.error('Erro ao editar semáforo:', error);
      setErrorMessage('Falha na comunicação com o servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Previne a propagação de eventos quando clica dentro do modal
  const handleModalContentClick = (e) => {
    e.stopPropagation();
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

      {isModalOpen && (
        <div 
          className="modal-overlay"
          onClick={closeModal}
        >
          <div 
            className="edit-modal"
            onClick={handleModalContentClick}
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
              <div className="form-group">
                <label htmlFor="latitude">Latitude:</label>
                <input 
                  type="text" 
                  id="latitude" 
                  name="latitude" 
                  value={formData.latitude} 
                  onChange={handleInputChange} 
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude:</label>
                <input 
                  type="text" 
                  id="longitude" 
                  name="longitude" 
                  value={formData.longitude} 
                  onChange={handleInputChange} 
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="operational" className="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="operational" 
                    name="operational" 
                    checked={formData.operational} 
                    onChange={handleInputChange} 
                  />
                  <span>Operacional</span>
                </label>
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
        </div>
      )}
    </>
  );
};

export default EditTrafficLightButton;