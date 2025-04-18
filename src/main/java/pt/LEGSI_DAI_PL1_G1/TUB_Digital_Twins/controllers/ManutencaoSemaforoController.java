package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.ManutencaoSemaforo;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.ManutencaoSemaforoDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.ManutencaoSemaforoService;

import java.util.List;

@RestController
@RequestMapping("/semaforos/manutencao-semaforo")
@RequiredArgsConstructor
public class ManutencaoSemaforoController {

    private final ManutencaoSemaforoService manutencaoSemaforoService;

    @PostMapping
    public ResponseEntity<ManutencaoSemaforo> criarManutencaoSemaforo(@RequestBody ManutencaoSemaforoDTO manutencaoSemaforoDTO) {
        try {
            ManutencaoSemaforo novaManutencaoSemaforo = manutencaoSemaforoService.criarManutencaoSemaforo(manutencaoSemaforoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaManutencaoSemaforo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ManutencaoSemaforo>> listarTodasManutencoesDosSemaforos() {
        try {
            List<ManutencaoSemaforo> manutencoesDosSemaforos = manutencaoSemaforoService.listarTodasManutencoesDosSemaforos();
            return ResponseEntity.ok(manutencoesDosSemaforos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ManutencaoSemaforo> buscarManutencaoSemaforoPorId(@PathVariable Long id) {
        try {
            return manutencaoSemaforoService.buscarManutencaoSemaforoPorId(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/semaforo/{semaforoId}")
    public ResponseEntity<List<ManutencaoSemaforo>> buscarManutencoesPorSemaforoId(@PathVariable Long semaforoId) {
        try {
            List<ManutencaoSemaforo> manutencoesDoSemaforo = manutencaoSemaforoService.buscarManutencoesPorSemaforoId(semaforoId);
            return ResponseEntity.ok(manutencoesDoSemaforo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/semaforo/{semaforoId}/agendadas")
    public ResponseEntity<List<ManutencaoSemaforo>> buscarManutencoesAgendadasPorSemaforoId(@PathVariable Long semaforoId) {
        try {
            List<ManutencaoSemaforo> manutencoesAgendadas = manutencaoSemaforoService.buscarManutencoesAgendadasPorSemaforoId(semaforoId);
            return ResponseEntity.ok(manutencoesAgendadas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ManutencaoSemaforo> atualizarManutencaoSemaforo(@PathVariable Long id, @RequestBody ManutencaoSemaforoDTO manutencaoSemaforoDTO) {
        try {
            ManutencaoSemaforo manutencaoSemaforoAtualizada = manutencaoSemaforoService.atualizarManutencaoSemaforo(id, manutencaoSemaforoDTO);
            return ResponseEntity.ok(manutencaoSemaforoAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> apagarManutencaoSemaforo(@PathVariable Long id) {
        try {
            manutencaoSemaforoService.apagarManutencaoSemaforo(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}