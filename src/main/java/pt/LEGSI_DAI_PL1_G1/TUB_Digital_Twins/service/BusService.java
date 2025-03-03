package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import org.springframework.beans.factory.annotation.Autowired;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Bus;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.BusDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.BusRepository;


import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BusService {

    @Autowired
    private BusRepository busRepository;

    public List<BusDTO> findAll() {
        return busRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BusDTO findById(Long id) {
        Optional<Bus> busOptional = busRepository.findById(id);
        return busOptional.map(this::convertToDTO).orElse(null);
    }

    public BusDTO findByMatricula(String matricula) {
        Optional<Bus> busOptional = busRepository.findByMatricula(matricula);
        return busOptional.map(this::convertToDTO).orElse(null);
    }

    @Transactional
    public BusDTO save(BusDTO busDTO) {
        Bus bus = convertToEntity(busDTO);
        Bus savedBus = busRepository.save(bus);
        return convertToDTO(savedBus);
    }

    @Transactional
    public BusDTO update(Long id, BusDTO busDTO) {
        Optional<Bus> existingBusOptional = busRepository.findById(id);

        if (existingBusOptional.isPresent()) {
            Bus existingBus = existingBusOptional.get();
            Bus bus = convertToEntity(busDTO);
            bus.setId(id);
            Bus updatedBus = busRepository.save(bus);
            return convertToDTO(updatedBus);
        }

        return null;
    }

    @Transactional
    public boolean delete(Long id) {
        if (busRepository.existsById(id)) {
            busRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public BusDTO updateLocalizacao(Long id, Double latitude, Double longitude) {
        Optional<Bus> busOptional = busRepository.findById(id);

        if (busOptional.isPresent()) {
            Bus bus = busOptional.get();
            bus.setLatitude(latitude);
            bus.setLongitude(longitude);
            Bus updatedBus = busRepository.save(bus);
            return convertToDTO(updatedBus);
        }
        return null;
    }

    @Transactional
    public BusDTO updateLotacao(Long id, Integer lotacaoAtual) {
        Optional<Bus> busOptional = busRepository.findById(id);

        if (busOptional.isPresent()) {
            Bus bus = busOptional.get();
            bus.setLotacaoAtual(lotacaoAtual);
            Bus updatedBus = busRepository.save(bus);
            return convertToDTO(updatedBus);
        }

        return null;
    }

    public Double getPercentagemOcupacaoAtual(Long id) {
        Optional<Bus> busOptional = busRepository.findById(id);

        if (busOptional.isPresent()) {
            Bus bus = busOptional.get();
            if (bus.getCapacidadeMaxima() != null && bus.getCapacidadeMaxima() > 0) {
                return (double) bus.getLotacaoAtual() / bus.getCapacidadeMaxima() * 100;
            }
        }

        return null;
    }


    private BusDTO convertToDTO(Bus bus) {
        BusDTO busDTO = new BusDTO();
        BeanUtils.copyProperties(bus, busDTO);
        busDTO.setPercentagemOcupacao(getPercentagemOcupacaoAtual(bus.getId()));
        return busDTO;
    }

    private Bus convertToEntity(BusDTO busDTO) {
        Bus bus = new Bus();
        BeanUtils.copyProperties(busDTO, bus);
        return bus;
    }
}