package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;


import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.AtualizarParagemRequest;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.AtualizarParagemResponse;
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
        stop.setTempoAteProximoAutocarro(stopDTO.tempoAteProximoAutocarro());

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

            // caso nao seja definido default de 10 minutos definir mais tarde
            if (stop.getTempoAteProximoAutocarro() == null) {
                stop.setTempoAteProximoAutocarro(10);
            }

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

    public Optional<Integer> getTempoAteProximoAutocarro(Long id) {
        return stopRepository.findById(id)
                .map(Stop::getTempoAteProximoAutocarro);
    }

    public StopDTO convertToDTO(Stop stop) {
        return new StopDTO(
                stop.getId(),
                stop.getNome(),
                stop.getCapacidadeMaxima(),
                stop.getLotacaoAtual(),
                stop.getTemperaturaAtual(),
                stop.getLongitude(),
                stop.getLatitude(),
                stop.getTempoAteProximoAutocarro(),
                stop.getUltimaAtualizacao(),
                stop.getPercentagemOcupacao(),
                stop.getEstadoOcupacao()
        );
    }

    public Optional<AtualizarParagemResponse> processarAtualizacaoParagem(Long id, AtualizarParagemRequest dados) {
        return stopRepository.findById(id).map(paragem -> {
            paragem.setLatitude(dados.latitude());
            paragem.setLongitude(dados.longitude());
            paragem.setLotacaoAtual(dados.lotacaoAtual());

            stopRepository.save(paragem);

            List<String> novosHorarios = calcularHorariosBaseadosNaLotacao(dados.lotacaoAtual());

            return new AtualizarParagemResponse(
                    paragem.getId(),
                    paragem.getLotacaoAtual(),
                    novosHorarios
            );
        });
    }

    private List<String> calcularHorariosBaseadosNaLotacao(Integer lotacao) {
        if (lotacao == null) return List.of("08:00", "08:30");

        if (lotacao <= 20) return List.of("08:00", "08:30");
        if (lotacao <= 50) return List.of("08:10", "08:40");
        return List.of("08:15", "08:45");
    }

}
