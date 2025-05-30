package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Rota;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.RotaService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/rotas")
public class RotaController {

    private final RotaService rotaService;

    @Autowired
    public RotaController(RotaService rotaService) {
        this.rotaService = rotaService;
    }

    @GetMapping
    public ResponseEntity<List<Rota>> getAllRotas() {
        List<Rota> rotas = rotaService.getAllRotas();
        return ResponseEntity.ok(rotas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rota> getRotaById(@PathVariable Long id) {
        try {
            Rota rota = rotaService.getRotaById(id);
            return ResponseEntity.ok(rota);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/sentido/{sentido}")
    public ResponseEntity<List<Rota>> getRotasBySentido(@PathVariable String sentido) {
        List<Rota> rotas = rotaService.getRotasBySentido(sentido);
        return ResponseEntity.ok(rotas);
    }


    @GetMapping("/nome/{nome}")
    public ResponseEntity<Rota> getRotaByNome(@PathVariable String nome) {
        return rotaService.getRotaByNome(nome)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/paragem/{stopId}")
    public ResponseEntity<List<Rota>> getRotasByStopId(@PathVariable Long stopId) {
        List<Rota> rotas = rotaService.getRotasByStopId(stopId);
        return ResponseEntity.ok(rotas);
    }

    @GetMapping("/semaforo/{trafficLightId}")
    public ResponseEntity<List<Rota>> getRotasByTrafficLightId(@PathVariable Long trafficLightId) {
        List<Rota> rotas = rotaService.getRotasByTrafficLightId(trafficLightId);
        return ResponseEntity.ok(rotas);
    }

    @PostMapping
    public ResponseEntity<Rota> createRota(@Valid @RequestBody Rota rota) {
        Rota novaRota = rotaService.createRota(rota);
        return new ResponseEntity<>(novaRota, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rota> updateRota(@PathVariable Long id, @Valid @RequestBody Rota rotaDetails) {
        try {
            Rota rotaAtualizada = rotaService.updateRota(id, rotaDetails);
            return ResponseEntity.ok(rotaAtualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRota(@PathVariable Long id) {
        try {
            rotaService.deleteRota(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{rotaId}/paragens/{stopId}")
    public ResponseEntity<Rota> addStopToRota(@PathVariable Long rotaId, @PathVariable Long stopId) {
        try {
            Rota rota = rotaService.addStopToRota(rotaId, stopId);
            return ResponseEntity.ok(rota);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{rotaId}/paragens/{stopId}")
    public ResponseEntity<Rota> removeStopFromRota(@PathVariable Long rotaId, @PathVariable Long stopId) {
        try {
            Rota rota = rotaService.removeStopFromRota(rotaId, stopId);
            return ResponseEntity.ok(rota);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{rotaId}/semaforos/{trafficLightId}")
    public ResponseEntity<Rota> addTrafficLightToRota(@PathVariable Long rotaId, @PathVariable Long trafficLightId) {
        try {
            Rota rota = rotaService.addTrafficLightToRota(rotaId, trafficLightId);
            return ResponseEntity.ok(rota);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{rotaId}/semaforos/{trafficLightId}")
    public ResponseEntity<Rota> removeTrafficLightFromRota(@PathVariable Long rotaId, @PathVariable Long trafficLightId) {
        try {
            Rota rota = rotaService.removeTrafficLightFromRota(rotaId, trafficLightId);
            return ResponseEntity.ok(rota);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/definir-ordem-paragens")
    public ResponseEntity<Rota> definirOrdemParagens(
            @PathVariable Long id,
            @RequestBody List<Long> stopIds) {

        Optional<Rota> rotaAtualizada = rotaService.definirOrdemParagens(id, stopIds);

        return rotaAtualizada
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{rotaId}/proxima-paragem/{paragemAtualId}")
    public ResponseEntity<Stop> getProximaParagem(
            @PathVariable Long rotaId,
            @PathVariable Long paragemAtualId) {

        Optional<Stop> proximaParagem = rotaService.determinarProximaParagem(rotaId, paragemAtualId);

        return proximaParagem
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/proxima-paragem")
    public ResponseEntity<Stop> getProximaParagem(
            @RequestParam String rotaNome,
            @RequestParam String sentido,
            @RequestParam Long paragemAtualId) {

        Optional<Stop> proximaParagem = rotaService.determinarProximaParagem(rotaNome, sentido, paragemAtualId);

        return proximaParagem
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}