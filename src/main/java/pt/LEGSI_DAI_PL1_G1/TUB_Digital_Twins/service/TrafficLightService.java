package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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
public class TrafficLightService {

    private final TrafficLightRepository trafficLightRepository;

    public List<TrafficLightDTO> getAllTrafficLights() {
        return trafficLightRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TrafficLightDTO getTrafficLightById(Long id) {
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Semaforo nao encontrado"));
        return convertToDTO(trafficLight);
    }

    @Transactional
    public TrafficLightDTO createTrafficLight(TrafficLightDTO dto) {
        TrafficLight trafficLight = new TrafficLight();
        trafficLight.setLatitude(dto.latitude());
        trafficLight.setLongitude(dto.longitude());
        trafficLight.setCurrentState(dto.currentState());
        trafficLight.setOperational(dto.operational());
        trafficLight.setLastMaintenance(LocalDateTime.now());
        trafficLight.setTimeUntilStateChange(dto.timeUntilStateChange());
        return convertToDTO(trafficLightRepository.save(trafficLight));
    }

    @Transactional
    public TrafficLightDTO updateTrafficLight(Long id, TrafficLightDTO dto) {
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new TrafficLightNotFound("Semaforo nao encontrado"));
        trafficLight.setLatitude(dto.latitude());
        trafficLight.setLongitude(dto.longitude());
        trafficLight.setCurrentState(dto.currentState());
        trafficLight.setOperational(dto.operational());
        trafficLight.setLastMaintenance(dto.lastMaintenance());
        trafficLight.setTimeUntilStateChange(dto.timeUntilStateChange());

        return convertToDTO(trafficLightRepository.save(trafficLight));
    }

    @Transactional
    public void deleteTrafficLight(Long id) {
        if (!trafficLightRepository.existsById(id)) {
            throw new EntityNotFoundException("Semaforo nao encontrado");
        }
        trafficLightRepository.deleteById(id);
    }

    private TrafficLightDTO convertToDTO(TrafficLight trafficLight) {
        return new TrafficLightDTO(
                trafficLight.getId(),
                trafficLight.getLatitude(),
                trafficLight.getLongitude(),
                trafficLight.getCurrentState(),
                trafficLight.isOperational(),
                trafficLight.getLastMaintenance(),
                trafficLight.getTimeUntilStateChange()
        );
    }
}
