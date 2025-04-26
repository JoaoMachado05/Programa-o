import { useState } from "react";
import "./AgendarManutencao.css";

const API_BASE_URL = "http://localhost:8080";

const AgendarManutencao = ({ isOpen, onClose, trafficLightId, onSubmit }) => {
  const [formData, setFormData] = useState({
    data: "",
    hora: "",
    descricao: ""
  });

  const [statusMensagem, setStatusMensagem] = useState({
    tipo: null,
    mensagem: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.data || !formData.hora) {
      setStatusMensagem({
        tipo: "erro",
        mensagem: "Por favor, preencha todos os campos obrigatórios."
      });
      return false;
    }

    const dataAgendada = new Date(`${formData.data}T${formData.hora}`);
    const hoje = new Date();
    
    if (dataAgendada < hoje) {
      setStatusMensagem({
        tipo: "erro",
        mensagem: "A data de manutenção não pode ser no passado."
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      setIsLoading(true);

      const dadosManutencao = {
        semaforoId: trafficLightId,
        dataAgendada: `${formData.data}T${formData.hora}:00`,
        descricao: formData.descricao
      };

      const response = await fetch(`${API_BASE_URL}/semaforos/manutencao-semaforo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosManutencao)
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const manutencaoCriada = await response.json();
      
      setStatusMensagem({
        tipo: "sucesso",
        mensagem: "Manutenção agendada com sucesso!"
      });

      if (onSubmit) {
        onSubmit(manutencaoCriada);
      }

      setTimeout(() => {
        setFormData({
          data: "",
          hora: "",
          descricao: ""
        });
        setStatusMensagem({ tipo: null, mensagem: "" });
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Erro ao agendar manutenção:", error);
      setStatusMensagem({
        tipo: "erro",
        mensagem: "Ocorreu um erro ao agendar a manutenção. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="agendar-manutencao-modal-overlay">
      <div className="agendar-manutencao-modal">
        <div className="agendar-manutencao-cabecalho">
          <h2>Agendar Manutenção - Semáforo #{trafficLightId}</h2>
          <button className="agendar-manutencao-btn-fechar" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="agendar-manutencao-form">
          <div className="agendar-manutencao-form-grupo">
            <label htmlFor="data">Data da Manutenção*:</label>
            <input
              type="date"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="agendar-manutencao-form-grupo">
            <label htmlFor="hora">Hora da Manutenção*:</label>
            <input
              type="time"
              id="hora"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="agendar-manutencao-form-grupo">
            <label htmlFor="descricao">Descrição/Observações:</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows="4"
              placeholder="Descreva o motivo da manutenção ou outras informações relevantes..."
            ></textarea>
          </div>
          
          {statusMensagem.mensagem && (
            <div className={`agendar-manutencao-mensagem-status ${statusMensagem.tipo}`}>
              {statusMensagem.mensagem}
            </div>
          )}
          
          <div className="agendar-manutencao-acoes-form">
            <button 
              type="button" 
              className="agendar-manutencao-btn agendar-manutencao-btn-cancelar" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="agendar-manutencao-btn agendar-manutencao-btn-agendar"
              disabled={isLoading}
            >
              {isLoading ? "Agendando..." : "Agendar Manutenção"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgendarManutencao;
