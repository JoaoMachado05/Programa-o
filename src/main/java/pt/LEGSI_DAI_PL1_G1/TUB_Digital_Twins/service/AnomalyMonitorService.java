package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.TrafficLightDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.NivelRisco;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.EventoRiscoDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.StopRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Slf4j
@Service
@RequiredArgsConstructor
public class AnomalyMonitorService {

    private static final Logger logger = LoggerFactory.getLogger(AnomalyMonitorService.class);
    private static final int LOTACAO_THRESHOLD = 5;

    private final StopRepository stopRepository;
    private final TrafficLightService trafficLightService;

    private final Map<Long, Integer> historicoLotacoes = new HashMap<>();

    @SuppressWarnings("unused")
    public void monitorarSemaforos() {
        List<TrafficLightDTO> semaforos = trafficLightService.getAllTrafficLights();

        for (TrafficLightDTO semaforo : semaforos) {
            verificarAnomaliasSemaforo(semaforo);
        }
    }

    private void verificarAnomaliasSemaforo(TrafficLightDTO semaforo) {
        if (semaforo.isInAnomaly() && semaforo.getStops() != null && !semaforo.getStops().isEmpty()) {
            for (Stop paragem : semaforo.getStops()) {
                verificarLotacaoParagem(paragem, semaforo.getId());
            }
        }
    }

    private void verificarLotacaoParagem(Stop paragem, Long semaforoId) {
        int lotacaoAtual = paragem.getLotacaoAtual();
        int lotacaoAnterior = historicoLotacoes.getOrDefault(paragem.getId(), 0);

        if (lotacaoAtual > lotacaoAnterior + LOTACAO_THRESHOLD) {
            notificarAumentoLotacao(paragem, semaforoId);
        }

        historicoLotacoes.put(paragem.getId(), lotacaoAtual);
    }

    private void notificarAumentoLotacao(Stop paragem, Long semaforoId) {
        String mensagem = String.format(
                "[NOTIFICAÇÃO] A paragem %s está a encher devido a uma anomalia no semáforo ID %d",
                paragem.getNome(), semaforoId
        );

        logger.warn(mensagem);
    }

    public String processarEventoRisco(EventoRiscoDTO evento) {
        Optional<Stop> optionalStop = stopRepository.findById(evento.getIdParagem());

        if (optionalStop.isEmpty()) {
            return "Paragem não encontrada";
        }

        Stop paragem = optionalStop.get();
        NivelRisco nivel = classificarGravidade(evento.getTipoRisco());

        switch (nivel) {
            case BAIXO -> {
                registarOcorrencia(paragem, evento.getTipoRisco());
                notificarSupervisorLocal(paragem);
                return "Ocorrência registada e supervisor notificado.";
            }
            case MEDIO -> {
                emitirAlertaCentroControlo(paragem);
                ativarVerificacaoRemota(paragem);
                return "Alerta enviado e verificação remota ativada.";
            }
            case ALTO -> {
                emitirAlertaCritico(paragem);
                notificarAutoridades(paragem);
                ativarRespostaImediata(paragem);
                return "Alerta crítico emitido e autoridades notificadas.";
            }
            default -> {
                return "Nenhuma ação tomada.";
            }
        }
    }

    private NivelRisco classificarGravidade(String tipoRisco) {
        return switch (tipoRisco.toLowerCase()) {
            case "objeto suspeito", "vandalismo" -> NivelRisco.ALTO;
            case "aglomeração" -> NivelRisco.MEDIO;
            default -> NivelRisco.BAIXO;
        };
    }

    private void registarOcorrencia(Stop paragem, String risco) {
        log.info("Registada ocorrência de '{}' na paragem {}", risco, paragem.getId());
    }

    private void notificarSupervisorLocal(Stop paragem) {
        log.info("Supervisor local notificado para paragem {}", paragem.getId());
    }

    private void emitirAlertaCentroControlo(Stop paragem) {
        log.info("Alerta enviado ao centro de controlo para paragem {}", paragem.getId());
    }

    private void ativarVerificacaoRemota(Stop paragem) {
        log.info("Verificação remota ativada para paragem {}", paragem.getId());
    }

    private void emitirAlertaCritico(Stop paragem) {
        log.warn("⚠ Alerta crítico emitido para paragem {}", paragem.getId());
    }

    private void notificarAutoridades(Stop paragem) {
        log.warn("Autoridades notificadas para paragem {}", paragem.getId());
    }

    private void ativarRespostaImediata(Stop paragem) {
        log.warn("Resposta imediata ativada: interdição da paragem {}", paragem.getId());
    }


}