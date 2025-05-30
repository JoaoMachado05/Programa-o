package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.TrafficLightDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.TrafficLightService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/traffic-lights")
@RequiredArgsConstructor
public class TrafficLightController {

    private final TrafficLightService trafficLightService;

    @GetMapping
    public ResponseEntity<List<TrafficLightDTO>> getAllTrafficLights() {
        return ResponseEntity.ok(trafficLightService.getAllTrafficLights());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrafficLightDTO> getTrafficLightById(@PathVariable Long id) {
        return ResponseEntity.ok(trafficLightService.getTrafficLightById(id));
    }

    @PostMapping
    public ResponseEntity<TrafficLightDTO> createTrafficLight(@RequestBody TrafficLightDTO dto) {
        return ResponseEntity.ok(trafficLightService.createTrafficLight(dto));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<TrafficLightDTO>> addMultipleTrafficLights(@RequestBody List<TrafficLightDTO> trafficLightDTOs) {
        List<TrafficLightDTO> savedLights = trafficLightService.saveAll(trafficLightDTOs);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLights);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrafficLightDTO> updateTrafficLight(
            @PathVariable Long id, @RequestBody TrafficLightDTO dto) {
        return ResponseEntity.ok(trafficLightService.updateTrafficLight(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrafficLight(@PathVariable Long id) {
        trafficLightService.deleteTrafficLight(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para atualizar o estado de anomalia de um semáforo
     *
     * @param id ID do semáforo
     * @param status objeto contendo o status de anomalia
     * @return ResponseEntity com o semáforo atualizado
     */
    @PatchMapping("/{id}/anomaly")
    public ResponseEntity<TrafficLightDTO> updateAnomalyStatus(
            @PathVariable Long id, @RequestBody Map<String, Boolean> status) {
        Boolean inAnomaly = status.get("inAnomaly");
        if (inAnomaly == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(trafficLightService.updateAnomalyStatus(id, inAnomaly));
    }

    /**
     * Endpoint para ativar a prioridade para o BRT (Bus Rapid Transit).
     * Muda o semáforo para vermelho para permitir a passagem do BRT.
     *
     * @param id ID do semáforo que receberá o sinal de prioridade
     * @param busInfo Objeto contendo o ID do ônibus BRT
     * @return ResponseEntity com o resultado da operação
     */
    @PostMapping("/{id}/brt-priority")
    public ResponseEntity<?> activateBrtPriority(
            @PathVariable Long id,
            @RequestBody Map<String, Long> busInfo) {

        Long busId = busInfo.get("busId");
        if (busId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "O ID do ônibus BRT é obrigatório"));
        }

        boolean success = trafficLightService.activateBrtPriority(id, busId);

        if (success) {
            return ResponseEntity.ok()
                    .body(Map.of("message", "Prioridade BRT ativada com sucesso para o semáforo " + id));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Não foi possível ativar a prioridade BRT para o semáforo " + id));
        }
    }

    /**
     * Endpoint para desativar a prioridade para o BRT e restaurar o funcionamento normal
     * do semáforo após a passagem do BRT.
     *
     * @param id ID do semáforo que voltará ao funcionamento normal
     * @return ResponseEntity com o resultado da operação
     */
    @PostMapping("/{id}/reset-brt-priority")
    public ResponseEntity<?> deactivateBrtPriority(@PathVariable Long id) {
        boolean success = trafficLightService.deactivateBrtPriority(id);

        if (success) {
            return ResponseEntity.ok()
                    .body(Map.of("message", "Funcionamento normal restaurado para o semáforo " + id + " após passagem do BRT"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Não foi possível restaurar o funcionamento normal do semáforo " + id));
        }
    }

    /**
     * Endpoint para processar pedidos de alteração de estado de semáforo
     *
     * @param id ID do semáforo
     * @param estado Novo estado desejado (RED, YELLOW ou GREEN)
     * @return ResponseEntity com o resultado da operação
     */
    @PutMapping("/{id}/state/{estado}")
    public ResponseEntity<?> alterarEstadoSemaforo(@PathVariable Long id, @PathVariable String estado) {
        boolean resultado = trafficLightService.processarPedidoAlteracao(id, estado);

        if (resultado) {
            return ResponseEntity.ok()
                    .body(Map.of("message", "Estado do semáforo alterado com sucesso para " + estado));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Não foi possível alterar o estado do semáforo. Verifique se o ID existe e se o estado é válido."));
        }
    }
}