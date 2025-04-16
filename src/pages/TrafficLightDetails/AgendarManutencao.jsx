import { useState } from "react";
import "./AgendarManutencao.css";

// API base URL
const API_BASE_URL = "http://localhost:8080";

const AgendarManutencao = ({ isOpen, onClose, trafficLightId, onSubmit }) => {
  // Estado para os dados do formulário
  const [formData, setFormData] = useState({
    data: "",
    hora: "",
    descricao: ""
  });

  // Estado para mensagens de erro/sucesso
  const [statusMensagem, setStatusMensagem] = useState({
    tipo: null, // "sucesso" ou "erro"
    mensagem: ""
  });

  // Estado para controlar o carregamento
  const [isLoading, setIsLoading] = useState(false);

  // Manipulador de alterações nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para validar o formulário
  const validarFormulario = () => {
    if (!formData.data || !formData.hora) {
      setStatusMensagem({
        tipo: "erro",
        mensagem: "Por favor, preencha todos os campos obrigatórios."
      });
      return false;
    }

    // Validação da data (não pode ser anterior a hoje)
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

  // Manipulador de envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Preparar dados para envio
      const dadosManutencao = {
        semaforoId: trafficLightId,
        dataAgendada: `${formData.data}T${formData.hora}:00`,
        descricao: formData.descricao
      };

      console.log("Enviando dados para a API:", dadosManutencao);

      // Enviar dados para a API com o URL completo
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
      console.log("Resposta da API:", manutencaoCriada);
      
      setStatusMensagem({
        tipo: "sucesso",
        mensagem: "Manutenção agendada com sucesso!"
      });

      // Chamar callback onSubmit se fornecido
      if (onSubmit) {
        onSubmit(manutencaoCriada);
      }

      // Limpar o formulário após alguns segundos e fechar o modal
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

  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-manutencao">
        <div className="modal-cabecalho">
          <h2>Agendar Manutenção - Semáforo #{trafficLightId}</h2>
          <button className="btn-fechar" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="form-manutencao">
          <div className="form-grupo">
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
          
          <div className="form-grupo">
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
          
          <div className="form-grupo">
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
            <div className={`mensagem-status ${statusMensagem.tipo}`}>
              {statusMensagem.mensagem}
            </div>
          )}
          
          <div className="acoes-form">
            <button 
              type="button" 
              className="btn btn-cancelar" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-agendar"
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