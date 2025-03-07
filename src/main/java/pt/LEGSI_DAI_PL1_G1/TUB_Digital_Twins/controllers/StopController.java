package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.StopDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.StopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/stops")
@RequiredArgsConstructor
public class StopController {

    private final StopService stopService;

    @GetMapping
    public List<StopDTO> getAllStops() {
        return stopService.getAllStops();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StopDTO> getStopById(@PathVariable Long id) {
        Optional<StopDTO> stopDTO = stopService.getStopById(id);
        return stopDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StopDTO> createStop(@RequestBody StopDTO stopDTO) {
        StopDTO createdStop = stopService.createStop(stopDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStop);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<StopDTO> updateStop(@PathVariable Long id, @RequestBody StopDTO stopDTO) {
        StopDTO updatedStop = stopService.updateStop(id, stopDTO);
        if (updatedStop != null) {
            return ResponseEntity.ok(updatedStop);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStop(@PathVariable Long id) {
        boolean deleted = stopService.deleteStop(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/percentagem-ocupacao")
    public ResponseEntity<Double> getStopOccupancyPercentage(@PathVariable Long id) {
        Optional<Double> percentage = stopService.getStopOccupancyPercentage(id);
        return percentage.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
