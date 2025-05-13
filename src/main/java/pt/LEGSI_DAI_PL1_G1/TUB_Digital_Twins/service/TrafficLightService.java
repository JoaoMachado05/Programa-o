package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.TrafficLightDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.exception.TrafficLightNotFound;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.TrafficLightRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrafficLightService {

    private final TrafficLightRepository trafficLightRepository;
    public record SavedTrafficLightState(TrafficLight.State previousState, int remainingTime) {}
    private final Map<Long, SavedTrafficLightState> savedStateMap = new ConcurrentHashMap<>();


    // Armazena o tempo restante de cada semáforo quando um BRT é detectado
    private final Map<Long, Integer> savedTimeMap = new HashMap<>();

    public List<TrafficLightDTO> getAllTrafficLights() {
        log.debug("Buscando todos os semáforos");
        return trafficLightRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TrafficLightDTO getTrafficLightById(Long id) {
        log.debug("Buscando semáforo com ID: {}", id);
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new TrafficLightNotFound("Semáforo não encontrado com ID: " + id));
        return convertToDTO(trafficLight);
    }

    @Transactional
    public TrafficLightDTO createTrafficLight(TrafficLightDTO dto) {
        log.debug("Criando novo semáforo: {}", dto);
        TrafficLight trafficLight = new TrafficLight();
        updateTrafficLightFromDTO(trafficLight, dto);
        trafficLight.setLastMaintenance(LocalDateTime.now());
        trafficLight.setInAnomaly(false);

        TrafficLight savedTrafficLight = trafficLightRepository.save(trafficLight);
        log.info("Semáforo criado com ID: {}", savedTrafficLight.getId());
        return convertToDTO(savedTrafficLight);
    }

    @Transactional
    public TrafficLightDTO updateTrafficLight(Long id, TrafficLightDTO dto) {
        log.debug("Atualizando semáforo com ID: {}", id);
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new TrafficLightNotFound("Semáforo não encontrado com ID: " + id));

        updateTrafficLightFromDTO(trafficLight, dto);

        TrafficLight updatedTrafficLight = trafficLightRepository.save(trafficLight);
        log.info("Semáforo atualizado com ID: {}", id);
        return convertToDTO(updatedTrafficLight);
    }

    @Transactional
    public void deleteTrafficLight(Long id) {
        log.debug("Removendo semáforo com ID: {}", id);
        if (!trafficLightRepository.existsById(id)) {
            throw new TrafficLightNotFound("Semáforo não encontrado com ID: " + id);
        }
        trafficLightRepository.deleteById(id);
        log.info("Semáforo removido com ID: {}", id);
    }

    @Transactional
    public TrafficLightDTO updateAnomalyStatus(Long id, boolean inAnomaly) {
        log.debug("Atualizando estado de anomalia do semáforo ID: {} para: {}", id, inAnomaly);
        TrafficLight trafficLight = trafficLightRepository.findById(id)
                .orElseThrow(() -> new TrafficLightNotFound("Semáforo não encontrado com ID: " + id));

        trafficLight.setInAnomaly(inAnomaly);
        TrafficLight updatedTrafficLight = trafficLightRepository.save(trafficLight);
        log.info("Estado de anomalia atualizado para semáforo ID: {}", id);
        return convertToDTO(updatedTrafficLight);
    }

    /**
     * Ativa o modo de prioridade para BRT no semáforo quando um sensor detecta a aproximação de um BRT.
     * Salva o tempo restante do estado atual e muda o semáforo para vermelho para permitir a passagem do BRT.
     *
     * @param trafficLightId ID do semáforo que receberá o sinal de prioridade
     * @param busId ID do ônibus BRT que está se aproximando
     * @return true se a operação foi bem-sucedida, false caso contrário
     */
    @Transactional
    public boolean activateBrtPriority(Long trafficLightId, Long busId) {
        log.debug("Ativando prioridade BRT para semaforo ID: {} e onibus ID: {}", trafficLightId, busId);

        TrafficLight trafficLight = trafficLightRepository.findById(trafficLightId)
                .orElseThrow(() -> new TrafficLightNotFound("Semaforo nao encontrado com ID: " + trafficLightId));

        if (Boolean.TRUE.equals(trafficLight.getBrtPriorityActive())) {
            log.warn("Semaforo ID: {} ja esta com prioridade BRT ativa", trafficLightId);
            return false;
        }

        // Guarda o estado atual e o tempo restante
        savedStateMap.put(trafficLightId, new SavedTrafficLightState(
                trafficLight.getCurrentState(),
                trafficLight.getTimeUntilStateChange()
        ));
        log.debug("Estado salvo: {} com {}s restantes", trafficLight.getCurrentState(), trafficLight.getTimeUntilStateChange());

        // Prioridade: primeiro muda para amarelo durante 3 segundos
        trafficLight.setCurrentState(TrafficLight.State.YELLOW);
        trafficLight.setTimeUntilStateChange(3);
        trafficLight.setBrtPriorityActive(true);
        trafficLight.setPriorityBusId(busId);

        trafficLightRepository.save(trafficLight);

        // Agenda uma tarefa para mudar para vermelho após 3 segundos
        CompletableFuture.runAsync(() -> {
            try {
                // Espera 3 segundos
                Thread.sleep(3000);

                // Busca o semáforo novamente para ter os dados mais recentes
                TrafficLight updatedTrafficLight = trafficLightRepository.findById(trafficLightId)
                        .orElseThrow(() -> new TrafficLightNotFound("Semaforo nao encontrado com ID: " + trafficLightId));

                // Verifica se ainda está com prioridade ativa e no estado amarelo
                if (Boolean.TRUE.equals(updatedTrafficLight.getBrtPriorityActive()) &&
                        updatedTrafficLight.getCurrentState() == TrafficLight.State.YELLOW) {

                    // Muda para vermelho com duração de 15 segundos
                    updatedTrafficLight.setCurrentState(TrafficLight.State.RED);
                    updatedTrafficLight.setTimeUntilStateChange(15);

                    trafficLightRepository.save(updatedTrafficLight);
                    log.debug("Semaforo ID: {} mudou de amarelo para vermelho após 3 segundos", trafficLightId);
                }
            } catch (InterruptedException e) {
                log.error("Erro ao aguardar transição de amarelo para vermelho: {}", e.getMessage());
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                log.error("Erro ao processar transição de amarelo para vermelho: {}", e.getMessage());
            }
        });

        log.info("Prioridade BRT ativada com sucesso para semaforo ID: {}", trafficLightId);
        return true;
    }


    /**
     * Desativa o modo de prioridade para BRT e restaura o semáforo para seu funcionamento normal.
     * Recupera o tempo que faltava antes da prioridade BRT e restaura o ciclo normal.
     *
     * @param trafficLightId ID do semáforo que receberá o sinal para voltar ao normal
     * @return true se a operação foi bem-sucedida, false caso contrário
     */
    @Transactional
    public boolean deactivateBrtPriority(Long trafficLightId) {
        log.debug("Desativando prioridade BRT para semaforo ID: {}", trafficLightId);

        TrafficLight trafficLight = trafficLightRepository.findById(trafficLightId)
                .orElseThrow(() -> new TrafficLightNotFound("Semaforo nao encontrado com ID: " + trafficLightId));

        if (!Boolean.TRUE.equals(trafficLight.getBrtPriorityActive())) {
            log.warn("Semaforo ID: {} nao esta com prioridade BRT ativa", trafficLightId);
            return false;
        }

        SavedTrafficLightState savedState = savedStateMap.remove(trafficLightId);
        if (savedState != null) {
            trafficLight.setCurrentState(savedState.previousState());
            trafficLight.setTimeUntilStateChange(savedState.remainingTime());
            log.debug("Estado restaurado: {} com {}s restantes", savedState.previousState(), savedState.remainingTime());
        } else {
            log.warn("Nenhum estado salvo encontrado para semaforo ID: {}", trafficLightId);
        }

        trafficLight.setBrtPriorityActive(false);
        trafficLight.setPriorityBusId(null);

        trafficLightRepository.save(trafficLight);
        log.info("Prioridade BRT desativada com sucesso para semaforo ID: {}", trafficLightId);
        return true;
    }


    private void updateTrafficLightFromDTO(TrafficLight trafficLight, TrafficLightDTO dto) {
        trafficLight.setLatitude(dto.latitude());
        trafficLight.setLongitude(dto.longitude());
        trafficLight.setCurrentState(dto.currentState());
        trafficLight.setOperational(dto.operational());
        trafficLight.setTimeUntilStateChange(dto.timeUntilStateChange());

        if (dto.lastMaintenance() != null) {
            trafficLight.setLastMaintenance(dto.lastMaintenance());
        } else if (trafficLight.getLastMaintenance() == null) {
            trafficLight.setLastMaintenance(LocalDateTime.now());
        }

        trafficLight.setInAnomaly(dto.isInAnomaly());

        // Atualizar tempos e configurações de BRT
        if (dto.greenTime() != null) {
            trafficLight.setGreenTime(dto.greenTime());
        }
        if (dto.redTime() != null) {
            trafficLight.setRedTime(dto.redTime());
        }
        if (dto.yellowTime() != null) {
            trafficLight.setYellowTime(dto.yellowTime());
        }
        if (dto.brtPriorityActive() != null) {
            trafficLight.setBrtPriorityActive(dto.brtPriorityActive());
        }
        if (dto.priorityBusId() != null) {
            trafficLight.setPriorityBusId(dto.priorityBusId());
        }
    }

    @Scheduled(fixedRate = 1000) // Executa a cada 1 segundo (1000 ms)
    public void updateTrafficLights() {
        List<TrafficLight> trafficLights = trafficLightRepository.findAll();

        for (TrafficLight trafficLight : trafficLights) {
            // Só atualiza o semáforo se estiver operacional e não estiver em anomalia
            // Também não atualiza se estiver com prioridade BRT ativa
            if (trafficLight.isOperational() && !trafficLight.isInAnomaly() &&
                    (trafficLight.getBrtPriorityActive() == null || !trafficLight.getBrtPriorityActive())) {
                trafficLight.tick();
                trafficLightRepository.save(trafficLight);
            }
        }
    }

    private TrafficLightDTO convertToDTO(TrafficLight trafficLight) {
        return TrafficLightDTO.builder()
                .id(trafficLight.getId())
                .latitude(trafficLight.getLatitude())
                .longitude(trafficLight.getLongitude())
                .currentState(trafficLight.getCurrentState())
                .operational(trafficLight.isOperational())
                .lastMaintenance(trafficLight.getLastMaintenance())
                .timeUntilStateChange(trafficLight.getTimeUntilStateChange())
                .inAnomaly(trafficLight.isInAnomaly())
                .stops(trafficLight.getStops())
                .greenTime(trafficLight.getGreenTime())
                .redTime(trafficLight.getRedTime())
                .yellowTime(trafficLight.getYellowTime())
                .brtPriorityActive(trafficLight.getBrtPriorityActive())
                .priorityBusId(trafficLight.getPriorityBusId())
                .build();
    }

    public boolean processarPedidoAlteracao(Long idSemaforo, String novoEstado) {
        return trafficLightRepository.findById(idSemaforo).map(semaforo -> {
            try {
                TrafficLight.State estado = TrafficLight.State.valueOf(novoEstado.toUpperCase());
                semaforo.setCurrentState(estado);
                trafficLightRepository.save(semaforo);
                return true;
            } catch (IllegalArgumentException e) {
                return false;
            }
        }).orElse(false);
    }
}