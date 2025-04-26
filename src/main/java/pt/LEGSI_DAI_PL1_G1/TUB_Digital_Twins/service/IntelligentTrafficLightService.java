package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.TrafficLightDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.BusRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.TrafficLightRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntelligentTrafficLightService {

    private final TrafficLightRepository trafficLightRepository;
    private final BusRepository busRepository;

    private final Map<Long, List<AdjustmentRecord>> adjustmentHistory = new HashMap<>();

    // RF023: Monitorização geral
    public List<TrafficLightDTO> monitorAllTrafficLights() {
        return trafficLightRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TrafficLightDTO monitorTrafficLight(Long id) {
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Semáforo não encontrado com ID: " + id));
        return convertToDTO(trafficLight);
    }

    // RF024: Ajuste dinâmico de tempos
    @Transactional
    public TrafficLightDTO adjustTimingsDynamically(Long id, Integer newGreenTime, Integer newRedTime, Integer newYellowTime) {
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Semáforo não encontrado com ID: " + id));

        Integer oldGreenTime = trafficLight.getGreenTime();
        Integer oldRedTime = trafficLight.getRedTime();
        Integer oldYellowTime = trafficLight.getYellowTime();

        trafficLight.setGreenTime(newGreenTime);
        trafficLight.setRedTime(newRedTime);
        trafficLight.setYellowTime(newYellowTime);

        updateTimeUntilStateChange(trafficLight);
        TrafficLight saved = trafficLightRepository.save(trafficLight);

        recordAdjustment(id, new AdjustmentRecord(
                LocalDateTime.now(), "DYNAMIC",
                Map.of("oldGreenTime", oldGreenTime, "oldRedTime", oldRedTime, "oldYellowTime", oldYellowTime,
                        "newGreenTime", newGreenTime, "newRedTime", newRedTime, "newYellowTime", newYellowTime)
        ));

        return convertToDTO(saved);
    }

    // RF025: Priorizar BRT
    @Transactional
    public TrafficLightDTO prioritizeBus(Long trafficLightId, Long busId) {
        if (!busRepository.existsById(busId)) {
            throw new EntityNotFoundException("Autocarro não encontrado com ID: " + busId);
        }

        TrafficLight trafficLight = trafficLightRepository.findById(trafficLightId)
                .orElseThrow(() -> new EntityNotFoundException("Semáforo não encontrado com ID: " + trafficLightId));

        String oldState = trafficLight.getCurrentState().name();

        if (!TrafficLight.State.GREEN.equals(trafficLight.getCurrentState())) {
            trafficLight.setCurrentState(TrafficLight.State.GREEN);
            trafficLight.setTimeUntilStateChange(trafficLight.getGreenTime());
        }

        trafficLight.setBrtPriorityActive(true);
        trafficLight.setPriorityBusId(busId);

        TrafficLight saved = trafficLightRepository.save(trafficLight);

        recordAdjustment(trafficLightId, new AdjustmentRecord(
                LocalDateTime.now(), "BRT_PRIORITY",
                Map.of("busId", busId, "oldState", oldState, "newState", "GREEN")
        ));

        return convertToDTO(saved);
    }

    // RF025: Desativar prioridade
    @Transactional
    public TrafficLightDTO deactivateBusPriority(Long trafficLightId) {
        TrafficLight trafficLight = trafficLightRepository.findById(trafficLightId)
                .orElseThrow(() -> new EntityNotFoundException("Semáforo não encontrado com ID: " + trafficLightId));

        Long oldBusId = trafficLight.getPriorityBusId();

        trafficLight.setBrtPriorityActive(false);
        trafficLight.setPriorityBusId(null);

        TrafficLight saved = trafficLightRepository.save(trafficLight);

        recordAdjustment(trafficLightId, new AdjustmentRecord(
                LocalDateTime.now(), "BRT_PRIORITY_DEACTIVATED",
                Map.of("oldBusId", oldBusId)
        ));

        return convertToDTO(saved);
    }

    // RF026: Integração com sistema da TUB (mockado)
    @Transactional
    public List<TrafficLightDTO> optimizeTrafficLightsForRoute(Long routeId) {
        List<TrafficLight> all = trafficLightRepository.findAll(); // mock, porque não há campo "route"
        List<TrafficLight> filtered = all.stream()
                .filter(t -> t.getId() % 2 == routeId % 2) // só para simular que estão na mesma rota
                .collect(Collectors.toList());

        for (TrafficLight light : filtered) {
            Integer oldGreenTime = light.getGreenTime();
            int bonus = calculateGreenTimeBonus(routeId, light.getId());

            light.setGreenTime(oldGreenTime + bonus);
            updateTimeUntilStateChange(light);

            recordAdjustment(light.getId(), new AdjustmentRecord(
                    LocalDateTime.now(), "ROUTE_OPTIMIZATION",
                    Map.of("routeId", routeId, "oldGreenTime", oldGreenTime,
                            "newGreenTime", light.getGreenTime(), "greenTimeBonus", bonus)
            ));
            trafficLightRepository.save(light);
        }

        return filtered.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // RF027: Histórico de ajustes
    public List<Map<String, Object>> getAdjustmentHistory(Long trafficLightId) {
        if (!trafficLightRepository.existsById(trafficLightId)) {
            throw new EntityNotFoundException("Semáforo não encontrado com ID: " + trafficLightId);
        }

        return adjustmentHistory.getOrDefault(trafficLightId, List.of()).stream()
                .map(record -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("timestamp", record.timestamp);
                    map.put("adjustmentType", record.adjustmentType);
                    map.putAll(record.details);
                    return map;
                })
                .collect(Collectors.toList());
    }

    // RF0XX: Deteção de anomalias
    public List<TrafficLightDTO> detectAnomalies() {
        return trafficLightRepository.findAll().stream()
                .filter(TrafficLight::isInAnomaly)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void updateTimeUntilStateChange(TrafficLight trafficLight) {
        if (trafficLight.getCurrentState() == TrafficLight.State.GREEN) {
            trafficLight.setTimeUntilStateChange(trafficLight.getGreenTime());
        } else if (trafficLight.getCurrentState() == TrafficLight.State.YELLOW) {
            trafficLight.setTimeUntilStateChange(trafficLight.getYellowTime());
        } else if (trafficLight.getCurrentState() == TrafficLight.State.RED) {
            trafficLight.setTimeUntilStateChange(trafficLight.getRedTime());
        }
    }

    private void recordAdjustment(Long id, AdjustmentRecord record) {
        adjustmentHistory.computeIfAbsent(id, k -> new ArrayList<>()).add(record);
        log.debug("Histórico atualizado para ID {}: {}", id, record);
    }

    private int calculateGreenTimeBonus(Long routeId, Long lightId) {
        return 5; // mock
    }

    private TrafficLightDTO convertToDTO(TrafficLight t) {
        return TrafficLightDTO.builder()
                .id(t.getId())
                .latitude(t.getLatitude())
                .longitude(t.getLongitude())
                .currentState(t.getCurrentState())
                .operational(t.isOperational())
                .lastMaintenance(t.getLastMaintenance())
                .timeUntilStateChange(t.getTimeUntilStateChange())
                .inAnomaly(t.isInAnomaly())
                .stops(t.getStops())
                .greenTime(t.getGreenTime())
                .redTime(t.getRedTime())
                .yellowTime(t.getYellowTime())
                .brtPriorityActive(t.getBrtPriorityActive())
                .priorityBusId(t.getPriorityBusId())
                .build();
    }

    private static class AdjustmentRecord {
        final LocalDateTime timestamp;
        final String adjustmentType;
        final Map<String, Object> details;

        AdjustmentRecord(LocalDateTime timestamp, String adjustmentType, Map<String, Object> details) {
            this.timestamp = timestamp;
            this.adjustmentType = adjustmentType;
            this.details = details;
        }

        @Override
        public String toString() {
            return "AdjustmentRecord{" +
                    "timestamp=" + timestamp +
                    ", type='" + adjustmentType + '\'' +
                    ", details=" + details +
                    '}';
        }
    }
}
