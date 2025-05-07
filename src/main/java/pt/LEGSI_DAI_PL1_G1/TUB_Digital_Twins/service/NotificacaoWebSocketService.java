package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.AtualizacaoLotacaoDTO;

@Service
@RequiredArgsConstructor
public class NotificacaoWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notificarMudancaLotacao(Stop stop) {
        AtualizacaoLotacaoDTO dto = new AtualizacaoLotacaoDTO(
                stop.getId(),
                stop.getNome(),
                stop.getLotacaoAtual(),
                stop.getPercentagemOcupacao(),
                stop.getEstadoOcupacao()
        );

        messagingTemplate.convertAndSend("/topic/stops", dto);
    }
}
