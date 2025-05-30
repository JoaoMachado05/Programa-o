package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;


import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Bus;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Rota;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.BusRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.StopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StopService {

    private final StopRepository stopRepository;
    private final BusRepository busRepository;
    private final BusService busService;
    private final RotaService rotaService;
    private static final Logger logger = LoggerFactory.getLogger(StopService.class);
    private final NotificacaoWebSocketService notificacaoWebSocketService;

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

            // Só atualizar se o valor não for nulo no DTO
            if (stopDTO.nome() != null) {
                stop.setNome(stopDTO.nome());
            }
            if (stopDTO.capacidadeMaxima() != null) {
                stop.setCapacidadeMaxima(stopDTO.capacidadeMaxima());
            }
            if (stopDTO.lotacaoAtual() != null) {
                stop.setLotacaoAtual(stopDTO.lotacaoAtual());
            }
            if (stopDTO.temperaturaAtual() != null) {
                stop.setTemperaturaAtual(stopDTO.temperaturaAtual());
            }
            if (stopDTO.longitude() != null) {
                stop.setLongitude(stopDTO.longitude());
            }
            if (stopDTO.latitude() != null) {
                stop.setLatitude(stopDTO.latitude());
            }
            if (stopDTO.message() != null) {
                stop.setMessage(stopDTO.message());
            }
            if (stopDTO.nextBusId() != null) {
                stop.setNextBusId(stopDTO.nextBusId());
            }

            // CRÍTICO: Só atualizar tempo se vier explicitamente no DTO
            if (stopDTO.tempoAteProximoAutocarro() != null) {
                stop.setTempoAteProximoAutocarro(stopDTO.tempoAteProximoAutocarro());
            }
            // Remover o default de 10 minutos aqui - pode estar a sobrescrever!

            Stop updatedStop = stopRepository.save(stop);
            return convertToDTO(updatedStop);
        }
        return null;
    }

    @Transactional
    public StopDTO atualizarPessoas(Long id, int numPessoas) {
        Stop stop = stopRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Paragem com ID " + id + " não encontrada."));

        stop.setLotacaoAtual(numPessoas);
        Stop stopAtualizado = stopRepository.save(stop);

        return convertToDTO(stopAtualizado);
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

        // Definir tempo ate proximo autocarro (10 minutos o predefinido)
        stop.setTempoAteProximoAutocarro(10); // 20 unidades = 10 minutos

        // Atualizar o nextBus da paragem atual para o próximo autocarro da rota
        // (remove a referência ao autocarro que acabou de chegar)
        stop.setNextBusId(null);
        stop.setMessage(null);
        stop.setPreviousStop(false);

        // 3. Atualizar nextBus e tempo das próximas paragens na rota
        Optional<Rota> rotaOpt = rotaService.getRotaByParagem(stop.getId());
        if (rotaOpt.isPresent()) {
            Rota rota = rotaOpt.get();

            // Usar o método já definido para obter a próxima paragem
            Optional<Stop> nextStopOpt = rotaService.determinarProximaParagem(rota.getNome(), rota.getSentido(), stop.getId());

            if (nextStopOpt.isPresent()) {
                Stop nextStop = nextStopOpt.get();

                // Configurar a próxima paragem com aviso de que o autocarro está na paragem anterior
                nextStop.setPreviousStop(true);

                // Verificar a lotação do autocarro para personalizar a mensagem
                double percentagemLotacao = (double) bus.getLotacaoAtual() / bus.getCapacidadeMaxima() * 100;

                if (percentagemLotacao >= 90) {
                    nextStop.setMessage("Atenção: o autocarro está na paragem anterior com lotação quase completa (" +
                            Math.round(percentagemLotacao) + "%)");
                } else {
                    nextStop.setMessage("Atenção: o autocarro está na paragem anterior");
                }

                // DIMINUIR 1 MINUTO IMEDIATAMENTE NA PRÓXIMA PARAGEM
                int tempoAtualProxima = nextStop.getTempoAteProximoAutocarro() != null ?
                        nextStop.getTempoAteProximoAutocarro() : 10;
                int novoTempoProxima = Math.max(0, tempoAtualProxima - 1); // -1 minuto

                logger.info("Próxima paragem {} - Tempo diminuído de {} para {} minutos. Lotação: {}%",
                        nextStop.getNome(),
                        tempoAtualProxima * 0.5,
                        novoTempoProxima * 0.5,
                        Math.round(percentagemLotacao));

                // Salvar a próxima paragem atualizada
                stopRepository.save(nextStop);
            }

            List<Stop> paragens = rota.getStops();

            // Encontrar o índice da paragem atual
            int indiceParagemAtual = -1;
            for (int i = 0; i < paragens.size(); i++) {
                if (paragens.get(i).getId().equals(stop.getId())) {
                    indiceParagemAtual = i;
                    break;
                }
            }

            // Se encontrou a paragem atual, processar as próximas paragens
            if (indiceParagemAtual != -1) {
                List<Stop> paragensAtualizadas = new ArrayList<>();
                int paragensAtualizadasCount = 0;

                // NOVA LÓGICA: Iterar pelas próximas paragens até encontrar nextBusId null
                for (int i = indiceParagemAtual + 1; i < paragens.size(); i++) {
                    Stop proximaParagem = paragens.get(i);

                    logger.debug("Processando paragem {}: nextBusId={}, tempo={}",
                            proximaParagem.getNome(),
                            proximaParagem.getNextBusId(),
                            proximaParagem.getTempoAteProximoAutocarro());

                    // Se encontrar uma paragem com nextBus null, definir o bus atual e parar
                    if (proximaParagem.getNextBusId() == null) {
                        logger.info("Encontrada paragem {} com nextBus null - definindo para bus {}",
                                proximaParagem.getNome(), bus.getId());

                        // Definir o nextBusId como o autocarro atual
                        proximaParagem.setNextBusId(bus.getId());

                        // Definir tempo estimado (10 minutos = 20 unidades)
                        proximaParagem.setTempoAteProximoAutocarro(10);

                        paragensAtualizadas.add(proximaParagem);
                        paragensAtualizadasCount++;

                        logger.info("Paragem {} configurada com nextBus {} e tempo 10 minutos",
                                proximaParagem.getNome(), bus.getId());
                        break; // Parar após encontrar a primeira paragem null
                    }

                    // Para paragens que já têm nextBusId, diminuir o tempo gradualmente
                    int tempoAtual = proximaParagem.getTempoAteProximoAutocarro() != null ?
                            proximaParagem.getTempoAteProximoAutocarro() : 10;

                    // Diminuir progressivamente: 30 segundos (1 unidade) por paragem
                    int novoTempo = Math.max(0, tempoAtual - 1);
                    proximaParagem.setTempoAteProximoAutocarro(novoTempo);

                    paragensAtualizadas.add(proximaParagem);
                    paragensAtualizadasCount++;

                    logger.info("Paragem {} - Tempo atualizado de {} para {} minutos",
                            proximaParagem.getNome(),
                            tempoAtual * 0.5,
                            novoTempo * 0.5);
                }

                // Salvar todas as paragens atualizadas
                if (!paragensAtualizadas.isEmpty()) {
                    stopRepository.saveAll(paragensAtualizadas);
                    logger.info("Atualizadas {} paragens na rota {} - Tempos diminuídos e nextBus configurado",
                            paragensAtualizadasCount, rota.getNome());
                }
            }
        } else {
            logger.warn("Rota não encontrada para a paragem {}", stop.getNome());
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

    public Optional<BusDTO> getNextBus(Long paragemId) {
        logger.info("Buscando próximo autocarro para a paragem ID: {}", paragemId);

        // Buscar a paragem pelo ID
        Optional<Stop> stopOpt = stopRepository.findById(paragemId);

        if (stopOpt.isEmpty()) {
            logger.warn("Paragem com ID {} não encontrada", paragemId);
            throw new IllegalArgumentException("Paragem com ID " + paragemId + " não encontrada");
        }

        Stop stop = stopOpt.get();

        // Verificar se existe um próximo autocarro definido
        if (stop.getNextBusId() == null) {
            logger.info("Nenhum autocarro definido para a paragem {}", stop.getNome());
            return Optional.empty();
        }

        return busService.findById(stop.getNextBusId());

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
                stop.getEstadoOcupacao(),
                stop.getBilhetesValidados(),
                stop.getNextBusId(),
                stop.getMessage(),
                stop.getPreviousStop()
        );
    }

    @Transactional
    public Optional<AtualizarParagemResponse> processarAtualizacaoParagem(Long id, AtualizarParagemRequest dados) {
        return stopRepository.findById(id).map(paragem -> {
            paragem.setLatitude(dados.latitude());
            paragem.setLongitude(dados.longitude());

            // Verifica mudança de lotação
            boolean lotacaoAlterada = !paragem.getLotacaoAtual().equals(dados.lotacaoAtual());
            paragem.setLotacaoAtual(dados.lotacaoAtual());

            Stop updated = stopRepository.save(paragem);

            // Envia notificação via WebSocket
            if (lotacaoAlterada) {
                notificacaoWebSocketService.notificarMudancaLotacao(updated);
            }

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
