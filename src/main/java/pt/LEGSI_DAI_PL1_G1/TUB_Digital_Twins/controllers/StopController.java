package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.StopDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.StopService;
import lombok.RequiredArgsConstructor;
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

    @PatchMapping("/{id}")
    public ResponseEntity<StopDTO> updateStop(@PathVariable Long id, @RequestBody StopDTO stopDTO) {
        StopDTO updatedStop = stopService.updateStop(id, stopDTO);
        if (updatedStop != null) {
            return ResponseEntity.ok(updatedStop);
        }
        return ResponseEntity.notFound().build();
    }
}