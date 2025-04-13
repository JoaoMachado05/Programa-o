import { useState, useEffect } from "react";
import axios from "axios";

function ManutencaoAutocarro({ idAutocarro }) {
  const [manutencoes, setManutencoes] = useState([]);
  const [novaData, setNovaData] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  useEffect(() => {
    fetchManutencoes();
  }, []);

  const fetchManutencoes = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/manutencoes/${idAutocarro}`);
      setManutencoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar manutenções:", error);
    }
  };

  const adicionarManutencao = async () => {
    try {
      await axios.post("http://localhost:8080/manutencoes", {
        idAutocarro: idAutocarro,
        dataManutencao: novaData,
        descricaoIntervencao: novaDescricao,
      });
      setNovaData("");
      setNovaDescricao("");
      fetchManutencoes(); // Atualizar lista
    } catch (error) {
      console.error("Erro ao adicionar manutenção:", error);
    }
  };

  return (
    <div>
      <ul>
        {manutencoes.map((m) => (
          <li key={m.idManutencao}>
            <strong>Data:</strong> {m.dataManutencao} | <strong>Descrição:</strong> {m.descricaoIntervencao}
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
          placeholder="Descrição"
          value={novaDescricao}
          onChange={(e) => setNovaDescricao(e.target.value)}
        />
        <button onClick={adicionarManutencao}>Adicionar Manutenção</button>
      </div>
    </div>
  );
}

export default ManutencaoAutocarro;
