package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.TrafficLightDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.TrafficLightService;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.IntelligentTrafficLightService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/traffic-lights")
@RequiredArgsConstructor
public class TrafficLightController {

    private final TrafficLightService trafficLightService;
    private final IntelligentTrafficLightService intelligentService;

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
    // RF024 – Alterar tempos dinamicamente (verde, vermelho, amarelo)
    @PatchMapping("/{id}/timings")
    public ResponseEntity<TrafficLightDTO> adjustTimings(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> tempos) {

        return ResponseEntity.ok(intelligentService.adjustTimingsDynamically(
                id,
                tempos.getOrDefault("greenTime", 15),
                tempos.getOrDefault("redTime", 10),
                tempos.getOrDefault("yellowTime", 3)
        ));
    }

    // RF025 - alteração do fucnionamento dos semmaforos
    @PostMapping("/{trafficLightId}/prioritize/{busId}")
    public ResponseEntity<TrafficLightDTO> prioritizeBus(
            @PathVariable Long trafficLightId,
            @PathVariable Long busId) {
        return ResponseEntity.ok(intelligentService.prioritizeBus(trafficLightId, busId));
    }

    // RF025-Priorização de autocarros nos semáforos
    @PostMapping("/{trafficLightId}/deactivate-priority")
    public ResponseEntity<TrafficLightDTO> deactivatePriority(
            @PathVariable Long trafficLightId) {
        return ResponseEntity.ok(intelligentService.deactivateBusPriority(trafficLightId));
    }

    // RF026 - integração com os istema da TUB
    @PostMapping("/optimize/{routeId}")
    public ResponseEntity<List<TrafficLightDTO>> optimizeForRoute(@PathVariable Long routeId) {
        return ResponseEntity.ok(intelligentService.optimizeTrafficLightsForRoute(routeId));
    }

    // RF027 – Histórico de ajustes
    @GetMapping("/{id}/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(intelligentService.getAdjustmentHistory(id));
    }

    // RF028? – Deteção de falhas (anomalias)
    @GetMapping("/anomalies")
    public ResponseEntity<List<TrafficLightDTO>> detectAnomalies() {
        return ResponseEntity.ok(intelligentService.detectAnomalies());
    }

}
