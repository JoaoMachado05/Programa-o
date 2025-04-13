import { useState, useEffect } from "react";
import axios from "axios";

function UtilizacaoAutocarro({ idAutocarro }) {
  const [utilizacoes, setUtilizacoes] = useState([]);
  const [novaData, setNovaData] = useState("");
  const [novoPercurso, setNovoPercurso] = useState("");
  const [novoConsumo, setNovoConsumo] = useState("");

  useEffect(() => {
    fetchUtilizacoes();
  }, []);

  const fetchUtilizacoes = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/historicos/${idAutocarro}`);
      setUtilizacoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar utilizações:", error);
    }
  };

  const adicionarUtilizacao = async () => {
    try {
      await axios.post("http://localhost:8080/historicos", {
        idAutocarro: idAutocarro,
        dataUtilizacao: novaData,
        percursoRealizado: novoPercurso,
        consumo: parseFloat(novoConsumo),
      });
      setNovaData("");
      setNovoPercurso("");
      setNovoConsumo("");
      fetchUtilizacoes(); // Atualizar lista
    } catch (error) {
      console.error("Erro ao adicionar utilização:", error);
    }
  };

  return (
    <div>
      <ul>
        {utilizacoes.map((u) => (
          <li key={u.idHistorico}>
            <strong>Data:</strong> {u.dataUtilizacao} |
            <strong> Percurso:</strong> {u.percursoRealizado} |
            <strong> Consumo:</strong> {u.consumo} L
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "10px" }}>
        <input
          type="date"
          value={novaData}
          onChange={(e) => setNovaData(e.target.value)}
        />
        <input
          type="text"
          placeholder="Percurso realizado"
          value={novoPercurso}
          onChange={(e) => setNovoPercurso(e.target.value)}
        />
        <input
          type="number"
          placeholder="Consumo (L)"
          value={novoConsumo}
          onChange={(e) => setNovoConsumo(e.target.value)}
        />
        <button onClick={adicionarUtilizacao}>Adicionar Utilização</button>
      </div>
    </div>
  );
}

export default UtilizacaoAutocarro;
