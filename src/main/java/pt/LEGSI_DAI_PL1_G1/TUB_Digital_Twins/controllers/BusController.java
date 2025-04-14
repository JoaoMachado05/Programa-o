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
        log.debug("REST request para obter todos os ônibus");
        List<BusDTO> buses = busService.findAll();
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusDTO> getBusById(@PathVariable Long id) {
        log.debug("REST request para obter o ônibus com ID: {}", id);
        return busService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/matricula/{matricula}")
    public ResponseEntity<BusDTO> getBusByMatricula(@PathVariable String matricula) {
        log.debug("REST request para obter o ônibus com matrícula: {}", matricula);
        return busService.findByMatricula(matricula)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtém a percentagem de ocupação atual de um ônibus.
     *
     * @param id o ID do ônibus
     * @return a percentagem de ocupação ou 404 se o ônibus não existir
     */
    @GetMapping("/{id}/percentagem-ocupacao")
    public ResponseEntity<Double> getPercentagemOcupacao(@PathVariable Long id) {
        log.debug("REST request para obter a percentagem de ocupação do ônibus ID: {}", id);
        Double percentagem = busService.getPercentagemOcupacaoAtual(id);
        return percentagem != null ? ResponseEntity.ok(percentagem) : ResponseEntity.notFound().build();
    }

    /**
     * Cria um novo ônibus.
     *
     * @param busDTO os dados do ônibus a ser criado
     * @return o DTO do ônibus criado
     */
    @PostMapping
    public ResponseEntity<BusDTO> createBus(@Valid @RequestBody BusDTO busDTO) {
        log.debug("REST request para criar um novo ônibus: {}", busDTO);
        BusDTO savedBus = busService.save(busDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBus);
    }

    /**
     * Atualiza um ônibus existente.
     *
     * @param id o ID do ônibus a ser atualizado
     * @param busDTO os novos dados do ônibus
     * @return o DTO do ônibus atualizado ou 404 se não existir
     */
    @PutMapping("/{id}")
    public ResponseEntity<BusDTO> updateBus(@PathVariable Long id, @Valid @RequestBody BusDTO busDTO) {
        log.debug("REST request para atualizar o ônibus ID: {}", id);
        return busService.update(id, busDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Remove um ônibus existente.
     *
     * @param id o ID do ônibus a ser removido
     * @return 204 No Content se removido com sucesso ou 404 se não existir
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable Long id) {
        log.debug("REST request para remover o ônibus ID: {}", id);
        return busService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    /**
     * Atualiza a localização de um ônibus.
     *
     * @param id o ID do ônibus
     * @param coordenadas mapa contendo latitude e longitude
     * @return o DTO do ônibus atualizado ou 404 se não existir
     */
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

    /**
     * Atualiza a lotação atual de um ônibus.
     *
     * @param id o ID do ônibus
     * @param lotacao mapa contendo o valor da lotação
     * @return o DTO do ônibus atualizado ou 404 se não existir
     */
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