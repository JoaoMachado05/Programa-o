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
import java.util.Optional;

@RestController
@RequestMapping("/brts")
@RequiredArgsConstructor
@Slf4j
public class BusController {

    private final BusService busService;

    // ✅ LISTAR AUTOCARROS
    @GetMapping
    public ResponseEntity<List<BusDTO>> getAllBuses() {
        log.debug("REST request para obter todos os ônibus");
        List<BusDTO> buses = busService.findAll();
        return ResponseEntity.ok(buses);
    }

    // ✅ CONSULTAR AUTOCARRO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<BusDTO> getBusById(@PathVariable Long id) {
        log.debug("REST request para obter o ônibus com ID: {}", id);
        return busService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ CONSULTAR AUTOCARRO POR MATRÍCULA
    @GetMapping("/matricula/{matricula}")
    public ResponseEntity<BusDTO> getBusByMatricula(@PathVariable String matricula) {
        log.debug("REST request para obter o ônibus com matrícula: {}", matricula);
        return busService.findByMatricula(matricula)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ OBTER PERCENTAGEM DE OCUPAÇÃO
    @GetMapping("/{id}/percentagem-ocupacao")
    public ResponseEntity<Double> getPercentagemOcupacao(@PathVariable Long id) {
        log.debug("REST request para obter a percentagem de ocupação do ônibus ID: {}", id);
        Double percentagem = busService.getPercentagemOcupacaoAtual(id);
        return percentagem != null ? ResponseEntity.ok(percentagem) : ResponseEntity.notFound().build();
    }

    // ✅ ADICIONAR AUTOCARRO
    @PostMapping
    public ResponseEntity<BusDTO> createBus(@Valid @RequestBody BusDTO busDTO) {
        log.debug("REST request para criar um novo ônibus: {}", busDTO);
        Optional<BusDTO> existingBus = busService.findByMatricula(busDTO.matricula());
        if (existingBus.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // Já existe
        }
        BusDTO savedBus = busService.save(busDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBus);
    }

    // ✅ EDITAR AUTOCARRO
    @PutMapping("/{id}")
    public ResponseEntity<BusDTO> updateBus(@PathVariable Long id, @Valid @RequestBody BusDTO busDTO) {
        log.debug("REST request para atualizar o ônibus ID: {}", id);
        Optional<BusDTO> existingBus = busService.findById(id);
        if (existingBus.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Não existe
        }
        Optional<BusDTO> updatedBus = busService.update(id, busDTO);
        return updatedBus.map(ResponseEntity::ok).orElse(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    // ✅ REMOVER AUTOCARRO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable Long id) {
        log.debug("REST request para remover o ônibus ID: {}", id);
        Optional<BusDTO> bus = busService.findById(id);
        if (bus.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Não existe
        }
        boolean deleted = busService.delete(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
    // REMOVER PELA MATRICULA
    /*@DeleteMapping("/matricula/{matricula}")
    public ResponseEntity<Void> deleteByMatricula(@PathVariable String matricula) {
        Optional<BusDTO> busOpt = busService.findByMatricula(matricula);
        if (busOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boolean deleted = busService.delete(busOpt.get().id());
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.internalServerError().build();
    }*/


    // ✅ ATUALIZAR LOCALIZAÇÃO
    @PatchMapping("/{id}/localizacao")
    public ResponseEntity<BusDTO> updateLocalizacao(
            @PathVariable Long id,
            @Valid @RequestBody Map<String, Double> coordenadas) {

        log.debug("REST request para atualizar a localização do ônibus ID: {}", id);
        Double latitude = coordenadas.get("latitude");
        Double longitude = coordenadas.get("longitude");

        if (latitude == null || longitude == null) {
            return ResponseEntity.badRequest().build();
        }

        return busService.updateLocalizacao(id, latitude, longitude)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ ATUALIZAR LOTAÇÃO
    @PatchMapping("/{id}/lotacao")
    public ResponseEntity<BusDTO> updateLotacao(
            @PathVariable Long id,
            @Valid @RequestBody Map<String, Integer> lotacao) {

        log.debug("REST request para atualizar a lotação do ônibus ID: {}", id);
        Integer lotacaoAtual = lotacao.get("lotacao");

        if (lotacaoAtual == null) {
            return ResponseEntity.badRequest().build();
        }

        return busService.updateLotacao(id, lotacaoAtual)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
