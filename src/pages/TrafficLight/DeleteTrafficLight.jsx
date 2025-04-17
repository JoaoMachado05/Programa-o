import React, { useState } from 'react';
import './DeleteTrafficLight.css';

const DeleteTrafficLightButton = ({ semaforoId, onDeleteTrafficLight }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Abre o modal de confirmação
  const openModal = () => {
    setIsModalOpen(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Fecha o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleting(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Implementa a lógica de remoção conforme o diagrama de sequência
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Chama a função de deletar do componente pai
      const result = await onDeleteTrafficLight(semaforoId);

      // Verifica o resultado conforme o diagrama
      if (result.success) {
        // Caso de sucesso: "semáforo removido"
        setSuccessMessage('Semáforo removido com sucesso!');
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        // Caso de erro: "Dados errados: Semáforo não encontrado"
        setErrorMessage(result.message || 'Erro ao remover semáforo');
      }
    } catch (error) {
      // Erro genérico no processo de remoção
      setErrorMessage('Falha na comunicação com o servidor');
      console.error('Erro ao remover semáforo:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        className="delete-button" 
        onClick={openModal} 
        title="Remover semáforo"
      >
        Remover
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Remover Semáforo</h3>
            <p>Tem certeza que deseja remover o semáforo com ID {semaforoId}?</p>
            
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            
            <div className="modal-buttons">
              <button 
                className="cancel-button" 
                onClick={closeModal} 
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="confirm-delete-button" 
                onClick={handleDelete} 
                disabled={isDeleting}
              >
                {isDeleting ? 'Removendo...' : 'Confirmar Remoção'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteTrafficLightButton;