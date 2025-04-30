package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Bus;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.AtualizarParagemRequest;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.AtualizarParagemResponse;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.ChegadaAutocarroDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.StopDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.BusRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.StopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StopService {

    private final StopRepository stopRepository;
    private final BusRepository busRepository;
    private final BusService busService;
    private static final Logger logger = LoggerFactory.getLogger(StopService.class);

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
        stop.setBilhetesValidados(0);

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

    @Transactional
    public Optional<StopDTO> validarBilhete(Long id) {
        logger.info("Recebido pedido de validação de bilhete para a paragem ID: {}", id);

        return stopRepository.findById(id).map(stop -> {
            // Incrementa o contador de bilhetes validados
            Integer bilhetesAtuais = stop.getBilhetesValidados() != null ? stop.getBilhetesValidados() : 0;
            stop.setBilhetesValidados(bilhetesAtuais + 1);

            // Salva a paragem atualizada
            Stop updatedStop = stopRepository.save(stop);
            logger.info("Validação de bilhete processada para paragem ID: {}. Total atual: {}",
                    id, updatedStop.getBilhetesValidados());

            return convertToDTO(updatedStop);
        });
    }

    public Optional<Integer> getTempoAteProximoAutocarro(Long id) {
        return stopRepository.findById(id)
                .map(Stop::getTempoAteProximoAutocarro);
    }

    @Transactional
    public Optional<Map<String, Object>> processarChegadaAutocarro(ChegadaAutocarroDTO chegadaDTO) {
        logger.info("Processando chegada de autocarro {} na paragem {}",
                chegadaDTO.autocarroId(), chegadaDTO.paragemId());

        // Buscar o autocarro e a paragem
        Optional<Stop> stopOpt = stopRepository.findById(chegadaDTO.paragemId());
        Optional<Bus> busOpt = busRepository.findById(chegadaDTO.autocarroId());

        if (stopOpt.isEmpty() || busOpt.isEmpty()) {
            logger.error("Autocarro ID {} ou paragem ID {} não encontrados",
                    chegadaDTO.autocarroId(), chegadaDTO.paragemId());
            return Optional.empty();
        }

        Stop stop = stopOpt.get();
        Bus bus = busOpt.get();

        // 1. Processar saída de passageiros do autocarro
        if (chegadaDTO.pessoasSaindo() != null && chegadaDTO.pessoasSaindo() > 0) {
            // Não permitir que saiam mais pessoas do que as que estão no autocarro
            int pessoasSaindo = Math.min(bus.getLotacaoAtual(), chegadaDTO.pessoasSaindo());
            bus.setLotacaoAtual(bus.getLotacaoAtual() - pessoasSaindo);
            logger.info("Saída de {} passageiros do autocarro {}", pessoasSaindo, bus.getMatricula());
        }

        // 2. Processar entrada de passageiros no autocarro (bilhetes validados)
        int bilhetesValidados = stop.getBilhetesValidados() != null ? stop.getBilhetesValidados() : 0;

        if (bilhetesValidados > 0) {
            // Verificar se o autocarro tem capacidade para todos os passageiros
            int capacidadeDisponivel = bus.getCapacidadeMaxima() - bus.getLotacaoAtual();
            int passageirosEntrando = Math.min(bilhetesValidados, capacidadeDisponivel);

            // Atualizar a lotação do autocarro
            bus.setLotacaoAtual(bus.getLotacaoAtual() + passageirosEntrando);

            // Reduzir a lotação da paragem apenas pelo número real de passageiros que entraram
            if (stop.getLotacaoAtual() >= passageirosEntrando) {
                stop.setLotacaoAtual(stop.getLotacaoAtual() - passageirosEntrando);
            } else {
                // Caso a lotação da paragem seja menor que o número de passageiros entrando
                // (situação anômala, mas que deve ser tratada)
                logger.warn("Lotação da paragem ({}) menor que passageiros entrando ({})",
                        stop.getLotacaoAtual(), passageirosEntrando);
                passageirosEntrando = stop.getLotacaoAtual();
                stop.setLotacaoAtual(0);
                bus.setLotacaoAtual(bus.getLotacaoAtual() - (bilhetesValidados - passageirosEntrando));
            }

            // Zerar os bilhetes validados da paragem, mas apenas os que foram usados
            int bilhetesRestantes = bilhetesValidados - passageirosEntrando;
            stop.setBilhetesValidados(bilhetesRestantes);

            logger.info("Entrada de {} passageiros no autocarro {} da paragem {}. {} bilhetes restantes.",
                    passageirosEntrando, bus.getMatricula(), stop.getNome(), bilhetesRestantes);
        } else {
            logger.info("Nenhum bilhete validado na paragem {}", stop.getNome());
        }

        // Salvar as entidades atualizadas
        Bus updatedBus = busRepository.save(bus);
        Stop updatedStop = stopRepository.save(stop);

        // Preparar resposta
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("autocarro", busService.convertToDTO(updatedBus));
        resultado.put("paragem", convertToDTO(updatedStop));

        return Optional.of(resultado);
    }
    /* Ainda esta sem uso por isso esta comentado
    public boolean verificarLotacao(StopDTO stopDTO) {
        if (stopDTO == null || stopDTO.capacidadeMaxima() == null || stopDTO.lotacaoAtual() == null) {
            return false;
        }
        return stopDTO.lotacaoAtual() < stopDTO.capacidadeMaxima();
    }

    public String executarFluxoSeguranca(Long stopId) {
        Optional<StopDTO> stopOpt = getStopById(stopId);
        if (stopOpt.isEmpty()) {
            return "Paragem não encontrada.";
        }
        StopDTO paragem = stopOpt.get();

        boolean lotacaoSegura = verificarLotacao(paragem);

        String gravidade = lotacaoSegura ? "gravidade_boa" : "gravidade_alta";

        logger.info("Fluxo de segurança: Risco com gravidade '{}' para a paragem com ID {}", gravidade, stopId);

        return "Fluxo de segurança executado. Gravidade: " + gravidade;
    }*/

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
                stop.getEstadoOcupacao(),
                stop.getBilhetesValidados()
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
