package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Bus;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.BusDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.BusRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusService {

    private final BusRepository busRepository;

    public List<BusDTO> findAll() {
        return busRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<BusDTO> findById(Long id) {
        return busRepository.findById(id).map(this::convertToDTO);
    }

    public Optional<BusDTO> findByMatricula(String matricula) {
        return busRepository.findByMatricula(matricula).map(this::convertToDTO);
    }

    @Transactional
    public BusDTO save(BusDTO busDTO) {
        Bus bus = convertToEntity(busDTO);

        if (bus.getLinhaAtual() == null || bus.getLinhaAtual().isEmpty()) {
            bus.setLinhaAtual("Linha 12");
        }

        Bus savedBus = busRepository.save(bus);
        return convertToDTO(savedBus);
    }


    @Transactional
    public Optional<BusDTO> update(Long id, BusDTO busDTO) {
        return busRepository.findById(id).map(existingBus -> {
            Bus bus = convertToEntity(busDTO);
            bus.setId(id);
            Bus updatedBus = busRepository.save(bus);
            return convertToDTO(updatedBus);
        });
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
    public Optional<BusDTO> updateLocalizacao(Long id, Double latitude, Double longitude) {
        return busRepository.findById(id).map(bus -> {
            bus.setLatitude(latitude);
            bus.setLongitude(longitude);
            Bus updatedBus = busRepository.save(bus);
            return convertToDTO(updatedBus);
        });
    }

    @Transactional
    public Optional<BusDTO> updateLotacao(Long id, Integer lotacaoAtual) {
        return busRepository.findById(id).map(bus -> {
            bus.setLotacaoAtual(lotacaoAtual);
            Bus updatedBus = busRepository.save(bus);
            return convertToDTO(updatedBus);
        });
    }

    public Double getPercentagemOcupacaoAtual(Long id) {
        return busRepository.findById(id)
                .filter(bus -> bus.getCapacidadeMaxima() != null && bus.getCapacidadeMaxima() > 0)
                .map(bus -> (double) bus.getLotacaoAtual() / bus.getCapacidadeMaxima() * 100)
                .orElse(null);
    }
    private BusDTO convertToDTO(Bus bus) {
        return new BusDTO(
                bus.getId(),
                bus.getMatricula(),
                bus.getCapacidadeMaxima() != null ? bus.getCapacidadeMaxima() : 50,
                bus.getLotacaoAtual() != null ? bus.getLotacaoAtual() : 25,
                bus.getLinhaAtual() != null ? bus.getLinhaAtual() : "Linha 12",
                bus.getVelocidade() != null ? bus.getVelocidade() : 45.7,
                bus.getTemperaturaAtual() != null ? bus.getTemperaturaAtual() : 22.5,
                bus.getLatitude() != null ? bus.getLatitude() : 41.545,
                bus.getLongitude() != null ? bus.getLongitude() : -8.426
        );
    }

    private Bus convertToEntity(BusDTO busDTO) {
        String linha = busDTO.getLinhaAtual() != null ? busDTO.getLinhaAtual() : "Desconhecida";

        Integer capacidadeMaxima = busDTO.getCapacidadeMaxima() != null ? busDTO.getCapacidadeMaxima() : 50; // valor por defeito
        Integer lotacaoAtual = busDTO.getLotacaoAtual() != null ? busDTO.getLotacaoAtual() : capacidadeMaxima / 2; // 50% por defeito
        Double velocidade = busDTO.getVelocidade() != null ? busDTO.getVelocidade() : 45.7;
        Double temperaturaAtual = busDTO.getTemperaturaAtual() != null ? busDTO.getTemperaturaAtual() : 22.5;
        Double latitude = busDTO.getLatitude() != null ? busDTO.getLatitude() : 41.545;
        Double longitude = busDTO.getLongitude() != null ? busDTO.getLongitude() : -8.426;

        Bus bus = new Bus(
                busDTO.getId(),
                busDTO.getMatricula(),
                busDTO.getCapacidadeMaxima(),
                busDTO.getLotacaoAtual(),
                linha,
                busDTO.getVelocidade(),
                busDTO.getTemperaturaAtual(),
                busDTO.getLatitude(),
                busDTO.getLongitude()
        );
        return bus;
    }
}