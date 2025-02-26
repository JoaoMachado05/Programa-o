package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import org.springframework.beans.factory.annotation.Autowired;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Bus;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.BusDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.BusRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BusService {
    private final BusRepository busRepository;

    public BusService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    @Transactional
    public BusDTO createBus(BusDTO busDTO) {
        Bus bus = new Bus();
        updateBusFromDTO(bus, busDTO);
        Bus savedBus = busRepository.save(bus);
        return convertToDTO(savedBus);
    }

    public List<BusDTO> getAllBuses() {
        return busRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<BusDTO> getBusById(Long id) {
        return busRepository.findById(id).map(this::convertToDTO);
    }

    @Transactional
    public Optional<BusDTO> updateBus(Long id, BusDTO busDTO) {
        return busRepository.findById(id).map(bus -> {
            updateBusFromDTO(bus, busDTO);
            Bus updatedBus = busRepository.save(bus);
            return convertToDTO(updatedBus);
        });
    }

    @Transactional
    public boolean deleteBus(Long id) {
        if (busRepository.existsById(id)) {
            busRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Conversão de Entity para DTO
    private BusDTO convertToDTO(Bus bus) {
        return new BusDTO(
                bus.getId(),
                bus.getLinha(),
                bus.getPassageiros(),
                bus.getVelocidade(),
                bus.getTemperatura(),
                bus.getLatitude(),
                bus.getLongitude()
        );
    }

    // Atualiza Entity a partir de DTO
    private void updateBusFromDTO(Bus bus, BusDTO busDTO) {
        bus.setLinha(busDTO.linha());
        bus.setPassageiros(busDTO.passageiros());
        bus.setVelocidade(busDTO.velocidade());
        bus.setTemperatura(busDTO.temperatura());
        bus.setLatitude(busDTO.latitude());
        bus.setLongitude(busDTO.longitude());
    }
}
