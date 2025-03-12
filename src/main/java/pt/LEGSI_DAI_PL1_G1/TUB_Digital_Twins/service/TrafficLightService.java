package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.TrafficLightDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.TrafficLightRepository;

import java.util.List;
import java.util.Optional;
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

    public TrafficLightDTO getTrafficLightById(String id) {
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Semaforo nao encontrado"));
        return convertToDTO(trafficLight);
    }

    @Transactional
    public TrafficLightDTO createTrafficLight(TrafficLightDTO dto) {
        TrafficLight trafficLight = new TrafficLight(
                dto.location()
        );
        trafficLight.setCurrentState(dto.currentState());
        trafficLight.setOperational(dto.operational());
        return convertToDTO(trafficLightRepository.save(trafficLight));
    }

    @Transactional
    public TrafficLightDTO updateTrafficLight(String id, TrafficLightDTO dto) {
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Semáforo não encontrado"));
        trafficLight.setLocation(dto.location());
        trafficLight.setCurrentState(dto.currentState());
        trafficLight.setOperational(dto.operational());
        return convertToDTO(trafficLightRepository.save(trafficLight));
    }


    @Transactional
    public void deleteTrafficLight(String id) {
        if (!trafficLightRepository.existsById(id)) {
            throw new EntityNotFoundException("Semaforo nao encontrado");
        }
        trafficLightRepository.deleteById(id);
    }

    private TrafficLightDTO convertToDTO(TrafficLight trafficLight) {
        return new TrafficLightDTO(
                trafficLight.getId(),
                trafficLight.getLocation(),
                trafficLight.getCurrentState(),
                trafficLight.isOperational()
        );
    }

}
