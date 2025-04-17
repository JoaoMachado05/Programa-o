package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.ManutencaoAutocarro;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.ManutencaoAutocarroDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.BusRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.ManutencaoAutocarroRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ManutencaoAutocarroService {

    private final ManutencaoAutocarroRepository manutencaoAutocarroRepository;
    private final BusRepository autocarroRepository;

    @Transactional
    public ManutencaoAutocarro criarManutencaoAutocarro(ManutencaoAutocarroDTO dto) {
        if (!autocarroRepository.existsById(dto.getAutocarroId())) {
            throw new IllegalArgumentException("Autocarro com ID " + dto.getAutocarroId() + " não encontrado");
        }

        ManutencaoAutocarro manutencao = new ManutencaoAutocarro(
                dto.getAutocarroId(),
                dto.getDataAgendada(),
                dto.getDescricao()
        );

        return manutencaoAutocarroRepository.save(manutencao);
    }

    @Transactional(readOnly = true)
    public List<ManutencaoAutocarro> listarTodasManutencoesAutocarro() {
        return manutencaoAutocarroRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<ManutencaoAutocarro> buscarManutencaoAutocarroPorId(Long id) {
        return manutencaoAutocarroRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<ManutencaoAutocarro> buscarManutencoesPorAutocarroId(Long autocarroId) {
        if (!autocarroRepository.existsById(autocarroId)) {
            throw new RuntimeException("Autocarro com ID " + autocarroId + " não encontrado");
        }

        return manutencaoAutocarroRepository.findByAutocarroId(autocarroId);
    }

    @Transactional(readOnly = true)
    public List<ManutencaoAutocarro> buscarManutencoesAgendadasPorAutocarroId(Long autocarroId) {
        if (!autocarroRepository.existsById(autocarroId)) {
            throw new RuntimeException("Autocarro com ID " + autocarroId + " não encontrado");
        }

        return manutencaoAutocarroRepository.findManutencoesAgendadasByAutocarroId(autocarroId, LocalDateTime.now());
    }

    @Transactional
    public ManutencaoAutocarro atualizarManutencaoAutocarro(Long id, ManutencaoAutocarroDTO dto) {
        ManutencaoAutocarro manutencao = manutencaoAutocarroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Manutenção com ID " + id + " não encontrada"));

        if (!autocarroRepository.existsById(dto.getAutocarroId())) {
            throw new IllegalArgumentException("Autocarro com ID " + dto.getAutocarroId() + " não encontrado");
        }

        manutencao.setAutocarroId(dto.getAutocarroId());
        manutencao.setDataAgendada(dto.getDataAgendada());
        manutencao.setDescricao(dto.getDescricao());

        return manutencaoAutocarroRepository.save(manutencao);
    }

    @Transactional
    public void apagarManutencaoAutocarro(Long id) {
        if (!manutencaoAutocarroRepository.existsById(id)) {
            throw new RuntimeException("Manutenção com ID " + id + " não encontrada");
        }

        manutencaoAutocarroRepository.deleteById(id);
    }
}