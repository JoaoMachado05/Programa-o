package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Riscos;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.CriarRiscosDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.RiscosDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.StopRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.RiscosRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RiscosService {

    private final RiscosRepository riscosRepository;
    private final StopRepository busStopRepository;

    @Transactional
    public RiscosDTO registarRisco(Long paragemId, CriarRiscosDTO dto) {
        Stop paragem = busStopRepository.findById(paragemId)
                .orElseThrow(() -> new NoSuchElementException("Paragem não encontrada com ID: " + paragemId));

        Riscos risco = Riscos.builder()
                .paragem(paragem)
                .gravidade(dto.gravidade())
                .tipo(dto.tipo())
                .dataReporte(LocalDateTime.now())
                .resolvida(false)
                .build();

        Riscos riscoSalvo = riscosRepository.save(risco);
        return mapToDTO(riscoSalvo);
    }

    @Transactional(readOnly = true)
    public List<RiscosDTO> obterHistoricoRiscosParagem(Long paragemId) {
        return riscosRepository.findByParagemId(paragemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RiscosDTO> obterRiscosAtivosParagem(Long paragemId) {
        return riscosRepository.findByParagemIdAndResolvida(paragemId, false).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RiscosDTO> obterRiscosResolvidosParagem(Long paragemId) {
        return riscosRepository.findByParagemIdAndResolvida(paragemId, true).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public RiscosDTO resolverRisco(Long riscoId) {
        Riscos risco = riscosRepository.findById(riscoId)
                .orElseThrow(() -> new NoSuchElementException("Risco não encontrado com ID: " + riscoId));

        risco.setResolvida(true);
        risco.setDataResolucao(LocalDateTime.now());

        return mapToDTO(riscosRepository.save(risco));
    }

    private RiscosDTO mapToDTO(Riscos risco) {
        return new RiscosDTO(
                risco.getId(),
                risco.getParagem().getId(),
                risco.getParagem().getNome(), // Assumindo que a classe BusStop tem um atributo "name"
                risco.getGravidade(),
                risco.getTipo(),
                risco.getDataReporte(),
                risco.getDataResolucao(),
                risco.isResolvida()
        );
    }
}