package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.BusDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.BusService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/brts")
@RequiredArgsConstructor
@Slf4j
public class BusController {

    private final BusService busService;

    @GetMapping
    public ResponseEntity<List<BusDTO>> getAllBuses() {
        List<BusDTO> buses = busService.findAll();
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusDTO> getBusById(@PathVariable Long id) {
        log.debug("REST request para obter o autocarro com ID: {}", id);
        return busService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/matricula/{matricula}")
    public ResponseEntity<BusDTO> getBusByMatricula(@PathVariable String matricula) {
        log.debug("REST request para obter o autocarro com matrícula: {}", matricula);
        return busService.findByMatricula(matricula)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/{id}/percentagem-ocupacao")
    public ResponseEntity<Double> getPercentagemOcupacao(@PathVariable Long id) {
        log.debug("REST request para obter a percentagem de ocupação do autocarro ID: {}", id);
        Double percentagem = busService.getPercentagemOcupacaoAtual(id);
        return percentagem != null ? ResponseEntity.ok(percentagem) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<BusDTO> createBus(@Valid @RequestBody BusDTO busDTO) {
        log.debug("REST request para criar um novo autocarro: {}", busDTO);
        BusDTO savedBus = busService.save(busDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBus);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<BusDTO>> createBuses(@Valid @RequestBody List<BusDTO> busDTOList) {
        List<BusDTO> savedBuses = busService.saveAll(busDTOList);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBuses);
    }


    @PutMapping("/{id}")
    public ResponseEntity<BusDTO> updateBus(@PathVariable Long id, @Valid @RequestBody BusDTO busDTO) {
        log.debug("REST request para atualizar o autocarro ID: {}", id);
        return busService.update(id, busDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable Long id) {
        log.debug("REST request para remover o autocarro ID: {}", id);
        return busService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/localizacao")
    public ResponseEntity<BusDTO> updateLocalizacao(
            @PathVariable Long id,
            @Valid @RequestBody Map<String, Double> coordenadas) {

        log.debug("REST request para atualizar a localização do autocarro ID: {}", id);
        Double latitude = coordenadas.get("latitude");
        Double longitude = coordenadas.get("longitude");

        if (latitude == null || longitude == null) {
            return ResponseEntity.badRequest().build();
        }

        return busService.updateLocalizacao(id, latitude, longitude)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/lotacao")
    public ResponseEntity<BusDTO> updateLotacao(
            @PathVariable Long id,
            @Valid @RequestBody Map<String, Integer> lotacao) {

        log.debug("REST request para atualizar a lotação do autocarro ID: {}", id);
        Integer lotacaoAtual = lotacao.get("lotacao");

        if (lotacaoAtual == null) {
            return ResponseEntity.badRequest().build();
        }

        return busService.updateLotacao(id, lotacaoAtual)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}