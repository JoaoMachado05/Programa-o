import { useEffect, useState } from "react";
import './RegrasPage.css'; 

// Funções de serviço integradas no mesmo arquivo
const API_URL = "http://localhost:8080/regras";

async function listarRegras() {
  const res = await fetch(API_URL);
  return res.json();
}

async function adicionarRegra(regra) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regra)
  });

  return res.json(); // Devolve a regra completa com id
}

async function removerRegra(regra) {
  const res = await fetch(`${API_URL}/${regra.id}`, {
    method: "DELETE"
  });
  return res.text();
}

async function editarRegra(regra) {
  const res = await fetch(`${API_URL}/${regra.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regra)  // Envia o objeto completo de regra
  });
  return res.text();
}

export default function RegrasPage() {
  const [regras, setRegras] = useState([]);
  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [parametro, setParametro] = useState("");
  const [critica, setCritica] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [modoEdicao, setModoEdicao] = useState(null);

  useEffect(() => {
    atualizarLista();
  }, []);

  const atualizarLista = async () => {
    const lista = await listarRegras();
    setRegras(lista);
  };

  const limparForm = () => {
    setTipo("");
    setData("");
    setParametro("");
    setCritica(false);
    setModoEdicao(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const regraAtualizada = {
      id: modoEdicao?.id,
      tipo,
      data,
      parametro,
      critica
    };

    try {
      if (modoEdicao) {
        const resposta = await editarRegra(regraAtualizada);
        setMensagem("Regra atualizada com sucesso!");
        setRegras(
          regras.map((r) => (r.id === regraAtualizada.id ? regraAtualizada : r))
        );
      } else {
        const nova = await adicionarRegra(regraAtualizada); // recebe regra com id!
        setMensagem("Regra adicionada com sucesso!");
        setRegras([...regras, nova]); // adiciona à lista
      }
    } catch (err) {
      setMensagem("Erro ao gravar regra.");
    }

    limparForm();
  };

  const handleEditar = (regra) => {
    setTipo(regra.tipo);
    setData(regra.data);
    setParametro(regra.parametro);
    setCritica(regra.critica);
    setModoEdicao(regra);
  };

  const handleRemover = async (regra) => {
    try {
      await removerRegra(regra);
      setMensagem("Regra removida com sucesso!");
      setRegras(regras.filter((r) => r.id !== regra.id));
    } catch (err) {
      setMensagem("Erro ao remover regra.");
    }
  };

  const handleVoltar = () => {
    // Assumindo que você está usando react-router ou uma navegação similar
    window.history.back();
    // Se estiver usando react-router:
    // navigate(-1);
    // ou para redirecionar para uma página específica:
    // window.location.href = '/';
  };

  return (
    <div className="regras-page">
      <div className="header-section">
        <button 
          onClick={handleVoltar} 
          className="btn-voltar"
          type="button">
          ← Voltar
        </button>
        <h2>{modoEdicao ? "Editar Regra" : "Adicionar Regra"}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <input
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Tipo"
              required
            />
          </div>
          <div>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>
          <div className="full-width">
            <input
              value={parametro}
              onChange={(e) => setParametro(e.target.value)}
              placeholder="Parâmetro"
              required
            />
          </div>
          <div className="checkbox-wrapper">
            <label>
              <input
                type="checkbox"
                checked={critica}
                onChange={(e) => setCritica(e.target.checked)}
              />
              Crítica
            </label>
          </div>
          <div className="full-width">
            <button type="submit">
              {modoEdicao ? "Salvar edição" : "Adicionar"}
            </button>
            {modoEdicao && (
              <button type="button" onClick={limparForm}>
                Cancelar edição
              </button>
            )}
          </div>
        </div>
      </form>

      {mensagem && <div className="mensagem">{mensagem}</div>}

      <h3>Lista de Regras</h3>
      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Data</th>
              <th>Parâmetro</th>
              <th>Crítica</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {regras.map((r) => (
              <tr key={r.id}>
                <td>{r.tipo}</td>
                <td>{r.data}</td>
                <td>{r.parametro}</td>
                <td className={r.critica ? "critica-sim" : ""}>
                  {r.critica ? "Sim" : "Não"}
                </td>
                <td>
                  <button onClick={() => handleEditar(r)}>Editar</button>
                  <button onClick={() => handleRemover(r)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}