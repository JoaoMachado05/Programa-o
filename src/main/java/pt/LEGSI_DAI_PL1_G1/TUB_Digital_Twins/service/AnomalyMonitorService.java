package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.TrafficLightDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnomalyMonitorService {

    private static final Logger logger = LoggerFactory.getLogger(AnomalyMonitorService.class);
    private static final int LOTACAO_THRESHOLD = 5;

    private final Map<Long, Integer> historicoLotacoes = new HashMap<>();
    private final TrafficLightService trafficLightService;

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

}