package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.CriarAvariaSemaforoDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.AvariaSemaforoDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.AvariaSemaforo;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.AvariaSemaforoRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.TrafficLightRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvariaSemaforoService {

    private final AvariaSemaforoRepository avariaSemaforoRepository;
    private final TrafficLightRepository trafficLightRepository;

    @Transactional
    public AvariaSemaforoDTO registarAvaria(Long semaforoId, CriarAvariaSemaforoDTO dto) {
        TrafficLight semaforo = trafficLightRepository.findById(semaforoId)
                .orElseThrow(() -> new NoSuchElementException("Semáforo não encontrado com id: " + semaforoId));

        AvariaSemaforo avaria = AvariaSemaforo.builder()
                .semaforo(semaforo)
                .gravidade(dto.gravidade())
                .tipo(dto.tipo())
                .dataReporte(LocalDateTime.now())
                .resolvida(false)
                .build();

        AvariaSemaforo salva = avariaSemaforoRepository.save(avaria);
        return converterParaDTO(salva);
    }

    @Transactional
    public AvariaSemaforoDTO resolverAvaria(Long avariaId) {
        AvariaSemaforo avaria = avariaSemaforoRepository.findById(avariaId)
                .orElseThrow(() -> new NoSuchElementException("Avaria não encontrada com id: " + avariaId));

        avaria.setResolvida(true);
        avaria.setDataResolucao(LocalDateTime.now());

        return converterParaDTO(avariaSemaforoRepository.save(avaria));
    }

    public List<AvariaSemaforoDTO> obterHistoricoAvariasSemaforo(Long semaforoId) {
        trafficLightRepository.findById(semaforoId)
                .orElseThrow(() -> new NoSuchElementException("Semáforo não encontrado com id: " + semaforoId));

        return avariaSemaforoRepository.findBySemaforoIdOrderByDataReporteDesc(semaforoId)
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<AvariaSemaforoDTO> obterAvariasAtivasSemaforo(Long semaforoId) {
        TrafficLight semaforo = trafficLightRepository.findById(semaforoId)
                .orElseThrow(() -> new NoSuchElementException("Semáforo não encontrado com id: " + semaforoId));

        return avariaSemaforoRepository.findBySemaforoAndResolvidaFalse(semaforo)
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<AvariaSemaforoDTO> obterAvariasResolvidasSemaforo(Long semaforoId) {
        TrafficLight semaforo = trafficLightRepository.findById(semaforoId)
                .orElseThrow(() -> new NoSuchElementException("Semáforo não encontrado com id: " + semaforoId));

        return avariaSemaforoRepository.findBySemaforoAndResolvidaTrue(semaforo)
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    private AvariaSemaforoDTO converterParaDTO(AvariaSemaforo avaria) {
        return new AvariaSemaforoDTO(
                avaria.getId(),
                avaria.getSemaforo().getId(),
                avaria.getGravidade(),
                avaria.getTipo(),
                avaria.getDataReporte(),
                avaria.getDataResolucao(),
                avaria.isResolvida()
        );
    }
}