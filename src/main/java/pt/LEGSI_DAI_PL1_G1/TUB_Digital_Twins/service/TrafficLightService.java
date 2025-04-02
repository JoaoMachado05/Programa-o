package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.TrafficLightDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.exception.TrafficLightNotFound;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.TrafficLightRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrafficLightService {

    private final TrafficLightRepository trafficLightRepository;

    public List<TrafficLightDTO> getAllTrafficLights() {
        log.debug("Buscando todos os semáforos");
        return trafficLightRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TrafficLightDTO getTrafficLightById(Long id) {
        log.debug("Buscando semáforo com ID: {}", id);
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new TrafficLightNotFound("Semáforo não encontrado com ID: " + id));
        return convertToDTO(trafficLight);
    }

    @Transactional
    public TrafficLightDTO createTrafficLight(TrafficLightDTO dto) {
        log.debug("Criando novo semáforo: {}", dto);
        TrafficLight trafficLight = new TrafficLight();
        updateTrafficLightFromDTO(trafficLight, dto);
        trafficLight.setLastMaintenance(LocalDateTime.now());
        trafficLight.setInAnomaly(false); // Inicialmente não está em anomalia

        TrafficLight savedTrafficLight = trafficLightRepository.save(trafficLight);
        log.info("Semáforo criado com ID: {}", savedTrafficLight.getId());
        return convertToDTO(savedTrafficLight);
    }

    @Transactional
    public TrafficLightDTO updateTrafficLight(Long id, TrafficLightDTO dto) {
        log.debug("Atualizando semáforo com ID: {}", id);
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new TrafficLightNotFound("Semáforo não encontrado com ID: " + id));

        updateTrafficLightFromDTO(trafficLight, dto);

        TrafficLight updatedTrafficLight = trafficLightRepository.save(trafficLight);
        log.info("Semáforo atualizado com ID: {}", id);
        return convertToDTO(updatedTrafficLight);
    }

    @Transactional
    public void deleteTrafficLight(Long id) {
        log.debug("Removendo semáforo com ID: {}", id);
        if (!trafficLightRepository.existsById(id)) {
            throw new TrafficLightNotFound("Semáforo não encontrado com ID: " + id);
        }
        trafficLightRepository.deleteById(id);
        log.info("Semáforo removido com ID: {}", id);
    }

    @Transactional
    public TrafficLightDTO updateAnomalyStatus(Long id, boolean inAnomaly) {
        log.debug("Atualizando estado de anomalia do semáforo ID: {} para: {}", id, inAnomaly);
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new TrafficLightNotFound("Semáforo não encontrado com ID: " + id));

        trafficLight.setInAnomaly(inAnomaly);
        TrafficLight updatedTrafficLight = trafficLightRepository.save(trafficLight);
        log.info("Estado de anomalia atualizado para semáforo ID: {}", id);
        return convertToDTO(updatedTrafficLight);
    }

    private void updateTrafficLightFromDTO(TrafficLight trafficLight, TrafficLightDTO dto) {
        trafficLight.setLatitude(dto.latitude());
        trafficLight.setLongitude(dto.longitude());
        trafficLight.setCurrentState(dto.currentState());
        trafficLight.setOperational(dto.operational());
        trafficLight.setTimeUntilStateChange(dto.timeUntilStateChange());

        // Manter a data da última manutenção se não for fornecida
        if (dto.lastMaintenance() != null) {
            trafficLight.setLastMaintenance(dto.lastMaintenance());
        } else if (trafficLight.getLastMaintenance() == null) {
            trafficLight.setLastMaintenance(LocalDateTime.now());
        }

        // Atualizar estado de anomalia se fornecido no DTO
        if (dto instanceof TrafficLightDTO) {
            trafficLight.setInAnomaly(dto.isInAnomaly());
        }
        // ✅ Adicionar campos inteligentes
        trafficLight.setGreenTime(dto.greenTime());
        trafficLight.setRedTime(dto.redTime());
        trafficLight.setYellowTime(dto.yellowTime());
        trafficLight.setBrtPriorityActive(dto.brtPriorityActive());
        trafficLight.setPriorityBusId(dto.priorityBusId());
    }

    private TrafficLightDTO convertToDTO(TrafficLight trafficLight) {
        return TrafficLightDTO.builder()
                .id(trafficLight.getId())
                .latitude(trafficLight.getLatitude())
                .longitude(trafficLight.getLongitude())
                .currentState(trafficLight.getCurrentState())
                .operational(trafficLight.isOperational())
                .lastMaintenance(trafficLight.getLastMaintenance())
                .timeUntilStateChange(trafficLight.getTimeUntilStateChange())
                .inAnomaly(trafficLight.isInAnomaly())
                .stops(trafficLight.getStops())
                .build();
    }
}