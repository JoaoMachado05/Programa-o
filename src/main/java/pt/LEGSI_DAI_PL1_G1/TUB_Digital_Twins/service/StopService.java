package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;


import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.StopDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.StopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StopService {

    private final StopRepository stopRepository;

    public List<StopDTO> getAllStops() {
        return stopRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public Optional<StopDTO> getStopById(Long id) {
        return stopRepository.findById(id).map(this::convertToDTO);
    }

    @Transactional
    public StopDTO createStop(StopDTO stopDTO) {
        Stop stop = new Stop();
        stop.setNome(stopDTO.nome());
        stop.setCapacidadeMaxima(stopDTO.capacidadeMaxima());
        stop.setLotacaoAtual(stopDTO.lotacaoAtual());
        stop.setTemperaturaAtual(stopDTO.temperaturaAtual());
        stop.setLongitude(stopDTO.longitude());
        stop.setLatitude(stopDTO.latitude());
        Stop savedStop = stopRepository.save(stop);
        return convertToDTO(savedStop);
    }

    @Transactional
    public StopDTO updateStop(Long id, StopDTO stopDTO) {
        Optional<Stop> stopOptional = stopRepository.findById(id);
        if (stopOptional.isPresent()) {
            Stop stop = stopOptional.get();
            stop.setNome(stopDTO.nome());
            stop.setCapacidadeMaxima(stopDTO.capacidadeMaxima());
            stop.setLotacaoAtual(stopDTO.lotacaoAtual());
            stop.setTemperaturaAtual(stopDTO.temperaturaAtual());
            stop.setLongitude(stopDTO.longitude());
            stop.setLatitude(stopDTO.latitude());
            Stop updatedStop = stopRepository.save(stop);
            return convertToDTO(updatedStop);
        }
        return null;
    }

    @Transactional
    public boolean deleteStop(Long id) {
        if (stopRepository.existsById(id)) {
            stopRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Double> getStopOccupancyPercentage(Long id) {
        return stopRepository.findById(id).map(stop -> {
            if (stop.getCapacidadeMaxima() != null && stop.getCapacidadeMaxima() > 0) {
                return (double) stop.getLotacaoAtual() / stop.getCapacidadeMaxima() * 100;
            }
            return null;
        });
    }

    private StopDTO convertToDTO(Stop stop) {
        return new StopDTO(
                stop.getId(),
                stop.getNome(),
                stop.getCapacidadeMaxima(),
                stop.getLotacaoAtual(),
                stop.getTemperaturaAtual(),
                stop.getLongitude(),    
                stop.getLatitude(),
                stop.getPercentagemOcupacao()
        );
    }
}
