package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.TrafficLightDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.TrafficLightService;

import java.util.List;

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
    public ResponseEntity<TrafficLightDTO> getTrafficLightById(@PathVariable String id) {
        return ResponseEntity.ok(trafficLightService.getTrafficLightById(id));
    }

    @PostMapping
    public ResponseEntity<TrafficLightDTO> createTrafficLight(@RequestBody TrafficLightDTO dto) {
        return ResponseEntity.ok(trafficLightService.createTrafficLight(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrafficLightDTO> updateTrafficLight(
            @PathVariable String id, @RequestBody TrafficLightDTO dto) {
        return ResponseEntity.ok(trafficLightService.updateTrafficLight(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrafficLight(@PathVariable String id) {
        trafficLightService.deleteTrafficLight(id);
        return ResponseEntity.noContent().build();
    }
}
