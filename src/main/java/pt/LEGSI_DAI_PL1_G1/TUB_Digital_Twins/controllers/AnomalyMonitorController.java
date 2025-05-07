package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.AnomalyMonitorService;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.EventoRiscoDTO;


@RestController
@RequestMapping("/anomaly-monitor")
@RequiredArgsConstructor
public class AnomalyMonitorController {

    private final AnomalyMonitorService anomalyMonitorService;

    @PostMapping("/monitor-semaforos")
    public ResponseEntity<Void> monitorarSemaforos() {
        anomalyMonitorService.monitorarSemaforos();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/evento-risco")
    public ResponseEntity<String> processarEventoRisco(@RequestBody EventoRiscoDTO eventoRiscoDTO) {
        String resultado = anomalyMonitorService.processarEventoRisco(eventoRiscoDTO);
        return ResponseEntity.ok(resultado);
    }

}
