package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.BusDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.BusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    @Autowired
    private BusService busService;

    @GetMapping
    public ResponseEntity<List<BusDTO>> getAllBuses() {
        List<BusDTO> buses = busService.findAll();
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusDTO> getBusById(@PathVariable Long id) {
        BusDTO busDTO = busService.findById(id);
        if (busDTO != null) {
            return ResponseEntity.ok(busDTO);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/matricula/{matricula}")
    public ResponseEntity<BusDTO> getBusByMatricula(@PathVariable String matricula) {
        BusDTO busDTO = busService.findByMatricula(matricula);
        if (busDTO != null) {
            return ResponseEntity.ok(busDTO);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/percentagem-ocupacao")
    public ResponseEntity<Double> getPercentagemOcupacao(@PathVariable Long id) {
        Double percentagem = busService.getPercentagemOcupacaoAtual(id);
        if (percentagem != null) {
            return ResponseEntity.ok(percentagem);
        }
        return ResponseEntity.notFound().build();
    }


    @PostMapping
    public ResponseEntity<BusDTO> createBus(@RequestBody BusDTO busDTO) {
        BusDTO savedBus = busService.save(busDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBus);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusDTO> updateBus(@PathVariable Long id, @RequestBody BusDTO busDTO) {
        BusDTO updatedBus = busService.update(id, busDTO);
        if (updatedBus != null) {
            return ResponseEntity.ok(updatedBus);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable Long id) {
        boolean deleted = busService.delete(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/localizacao")
    public ResponseEntity<BusDTO> updateLocalizacao(@PathVariable Long id, @RequestBody Map<String, Double> coordenadas) {
        Double latitude = coordenadas.get("latitude");
        Double longitude = coordenadas.get("longitude");
        BusDTO updatedBus = busService.updateLocalizacao(id, latitude, longitude);
        if (updatedBus != null) {
            return ResponseEntity.ok(updatedBus);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/lotacao")
    public ResponseEntity<BusDTO> updateLotacao(@PathVariable Long id, @RequestBody Integer lotacao) {
        BusDTO updatedBus = busService.updateLotacao(id, lotacao);
        if (updatedBus != null) {
            return ResponseEntity.ok(updatedBus);
        }
        return ResponseEntity.notFound().build();
    }
}