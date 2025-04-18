package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.ManutencaoSemaforo;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.ManutencaoSemaforoDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.ManutencaoSemaforoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ManutencaoSemaforoService {

    private final ManutencaoSemaforoRepository manutencaoSemaforoRepository;

    public ManutencaoSemaforo criarManutencaoSemaforo(ManutencaoSemaforoDTO manutencaoSemaforoDTO) {
        // Validações
        if (manutencaoSemaforoDTO.dataAgendada().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("A data de manutenção não pode ser no passado.");
        }

        // Criar e salvar nova manutenção de semáforo
        ManutencaoSemaforo novaManutencaoSemaforo = new ManutencaoSemaforo(
                manutencaoSemaforoDTO.semaforoId(),
                manutencaoSemaforoDTO.dataAgendada(),
                manutencaoSemaforoDTO.descricao()
        );

        return manutencaoSemaforoRepository.save(novaManutencaoSemaforo);
    }

    public List<ManutencaoSemaforo> listarTodasManutencoesDosSemaforos() {
        return manutencaoSemaforoRepository.findAll();
    }

    public Optional<ManutencaoSemaforo> buscarManutencaoSemaforoPorId(Long id) {
        return manutencaoSemaforoRepository.findById(id);
    }

    public List<ManutencaoSemaforo> buscarManutencoesPorSemaforoId(Long semaforoId) {
        return manutencaoSemaforoRepository.findBySemaforoId(semaforoId);
    }

    public List<ManutencaoSemaforo> buscarManutencoesAgendadasPorSemaforoId(Long semaforoId) {
        return manutencaoSemaforoRepository.findBySemaforoIdAndDataAgendadaAfter(
                semaforoId,
                LocalDateTime.now()
        );
    }

    public ManutencaoSemaforo atualizarManutencaoSemaforo(Long id, ManutencaoSemaforoDTO manutencaoSemaforoDTO) {
        return manutencaoSemaforoRepository.findById(id)
                .map(manutencaoSemaforo -> {
                    manutencaoSemaforo.setDataAgendada(manutencaoSemaforoDTO.dataAgendada());
                    manutencaoSemaforo.setDescricao(manutencaoSemaforoDTO.descricao());
                    return manutencaoSemaforoRepository.save(manutencaoSemaforo);
                })
                .orElseThrow(() -> new RuntimeException("Manutenção de semáforo não encontrada com o ID: " + id));
    }

    public void apagarManutencaoSemaforo(Long id) {
        if (!manutencaoSemaforoRepository.existsById(id)) {
            throw new RuntimeException("Manutenção de semáforo não encontrada com o ID: " + id);
        }
        manutencaoSemaforoRepository.deleteById(id);
    }
}