package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.VehiclePassage;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.VehiclePassageRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.VehicleDetectionService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicle-detection")
@RequiredArgsConstructor
public class VehicleDetectionController {

    private final VehicleDetectionService vehicleDetectionService;
    private final VehiclePassageRepository vehiclePassageRepository;

    @PostMapping("/detect")
    public ResponseEntity<Map<String, Object>> detectVehicle(
            @RequestParam String matricula,
            @RequestParam(required = false, defaultValue = "unknown") String vehicleType) {

        Map<String, Object> result = vehicleDetectionService.processVehicleDetection(matricula, vehicleType);
        return ResponseEntity.ok(result);
    }


    @PostMapping("/register-infraction/{passageId}")
    public ResponseEntity<Void> registerInfraction(@PathVariable Long passageId) {
        boolean registered = vehicleDetectionService.registerInfraction(passageId);

        if (registered) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/unauthorized")
    public ResponseEntity<List<VehiclePassage>> getUnauthorizedPassages() {
        List<VehiclePassage> passages = vehiclePassageRepository.findByAuthorizedFalse();
        return ResponseEntity.ok(passages);
    }


    @MessageMapping("/detect-vehicle")
    @SendTo("/topic/detection-results")
    public Map<String, Object> handleVehicleDetection(Map<String, String> detection) {
        String matricula = detection.get("matricula");
        String vehicleType = detection.getOrDefault("vehicleType", "unknown");

        return vehicleDetectionService.processVehicleDetection(matricula, vehicleType);
    }
}
