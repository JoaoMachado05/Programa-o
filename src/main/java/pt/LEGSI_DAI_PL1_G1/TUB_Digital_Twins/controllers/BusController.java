package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.BusDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.BusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buses")
@RequiredArgsConstructor
public class BusController {

    private final BusService busService;

    @GetMapping
    public ResponseEntity<List<BusDTO>> getAllBuses() {
        List<BusDTO> buses = busService.findAll();
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusDTO> getBusById(@PathVariable Long id) {
        return busService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/matricula/{matricula}")
    public ResponseEntity<BusDTO> getBusByMatricula(@PathVariable String matricula) {
        return busService.findByMatricula(matricula)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/percentagem-ocupacao")
    public ResponseEntity<Double> getPercentagemOcupacao(@PathVariable Long id) {
        Double percentagem = busService.getPercentagemOcupacaoAtual(id);
        return percentagem != null ? ResponseEntity.ok(percentagem) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<BusDTO> createBus(@RequestBody BusDTO busDTO) {
        BusDTO savedBus = busService.save(busDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBus);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusDTO> updateBus(@PathVariable Long id, @RequestBody BusDTO busDTO) {
        return busService.update(id, busDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable Long id) {
        return busService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/localizacao")
    public ResponseEntity<BusDTO> updateLocalizacao(@PathVariable Long id, @RequestBody Map<String, Double> coordenadas) {
        Double latitude = coordenadas.get("latitude");
        Double longitude = coordenadas.get("longitude");
        return busService.updateLocalizacao(id, latitude, longitude)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/lotacao")
    public ResponseEntity<BusDTO> updateLotacao(@PathVariable Long id, @RequestBody Map<String, Integer> lotacao) {
        Integer lotacaoAtual = lotacao.get("lotacao");
        return busService.updateLotacao(id, lotacaoAtual)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}