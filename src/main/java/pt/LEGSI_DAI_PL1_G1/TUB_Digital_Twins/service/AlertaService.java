package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlertaService {

    public void enviarAlertaLotacao(Long busId, Double percentagemOcupacao) {
        System.out.println("Alerta: Autocarro " + busId + " próximo da capacidade máxima (" +
                String.format("%.1f", percentagemOcupacao) + "%)");

        // Aqui meter para enviar alerta para próxima paragem ou para central de controle(ou ambos)
    }

    public void notificarEmergencia(Long busId, Double latitude, Double longitude,
                                    String descricao, String nivelSeveridade) {

        System.out.println("EMERGÊNCIA: Autocarro " + busId + " reportou obstrução na via");
        System.out.println("Localização: " + latitude + ", " + longitude);
        System.out.println("Descrição: " + descricao);
        System.out.println("Severidade: " + nivelSeveridade);

        // Aqui meter commo notificar serviços de emergência
    }
}