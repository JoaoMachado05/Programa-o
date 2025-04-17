package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.AvariaAutocarro;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Bus;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.AvariaAutocarroDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.CriarAvariaAutocarroDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.AvariaAutocarroRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.BusRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvariaAutocarroService {

    private final AvariaAutocarroRepository avariaAutocarroRepository;
    private final BusRepository autocarroRepository;

    @Transactional
    public AvariaAutocarroDTO registarAvaria(Long autocarroId, CriarAvariaAutocarroDTO dto) {
        Bus autocarro = autocarroRepository.findById(autocarroId)
                .orElseThrow(() -> new EntityNotFoundException("Autocarro com ID " + autocarroId + " não encontrado"));

        AvariaAutocarro avariaAutocarro = AvariaAutocarro.builder()
                .autocarro(autocarro)
                .gravidade(dto.getGravidade())
                .tipo(dto.getTipo())
                .dataReporte(LocalDateTime.now())
                .resolvida(false)
                .build();

        avariaAutocarro = avariaAutocarroRepository.save(avariaAutocarro);
        return convertToDTO(avariaAutocarro);
    }

    @Transactional(readOnly = true)
    public List<AvariaAutocarroDTO> obterHistoricoAvariasAutocarro(Long autocarroId) {
        if (!autocarroRepository.existsById(autocarroId)) {
            throw new EntityNotFoundException("Autocarro com ID " + autocarroId + " não encontrado");
        }

        return avariaAutocarroRepository.findByAutocarroId(autocarroId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AvariaAutocarroDTO> obterAvariasAtivasAutocarro(Long autocarroId) {
        if (!autocarroRepository.existsById(autocarroId)) {
            throw new EntityNotFoundException("Autocarro com ID " + autocarroId + " não encontrado");
        }

        return avariaAutocarroRepository.findAvariasAtivasByAutocarroId(autocarroId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AvariaAutocarroDTO> obterAvariasResolvidasAutocarro(Long autocarroId) {
        if (!autocarroRepository.existsById(autocarroId)) {
            throw new EntityNotFoundException("Autocarro com ID " + autocarroId + " não encontrado");
        }

        return avariaAutocarroRepository.findAvariasResolvidasByAutocarroId(autocarroId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AvariaAutocarroDTO resolverAvaria(Long avariaId) {
        AvariaAutocarro avariaAutocarro = avariaAutocarroRepository.findById(avariaId)
                .orElseThrow(() -> new EntityNotFoundException("Avaria com ID " + avariaId + " não encontrada"));

        avariaAutocarro.setResolvida(true);
        avariaAutocarro.setDataResolucao(LocalDateTime.now());
        avariaAutocarro = avariaAutocarroRepository.save(avariaAutocarro);

        return convertToDTO(avariaAutocarro);
    }

    private AvariaAutocarroDTO convertToDTO(AvariaAutocarro avariaAutocarro) {
        return AvariaAutocarroDTO.builder()
                .id(avariaAutocarro.getId())
                .autocarroId(avariaAutocarro.getAutocarro().getId())
                .gravidade(avariaAutocarro.getGravidade())
                .tipo(avariaAutocarro.getTipo())
                .dataReporte(avariaAutocarro.getDataReporte())
                .dataResolucao(avariaAutocarro.getDataResolucao())
                .resolvida(avariaAutocarro.isResolvida())
                .build();
    }
}