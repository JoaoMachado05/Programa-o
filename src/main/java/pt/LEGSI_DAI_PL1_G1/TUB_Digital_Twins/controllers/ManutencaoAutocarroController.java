package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.ManutencaoAutocarro;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.ManutencaoAutocarroDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.ManutencaoAutocarroService;

import java.util.List;

@RestController
@RequestMapping("/brts/manutencao-brts")
@RequiredArgsConstructor
public class ManutencaoAutocarroController {

    private final ManutencaoAutocarroService manutencaoAutocarroService;

    @PostMapping
    public ResponseEntity<ManutencaoAutocarro> criarManutencaoAutocarro(@RequestBody ManutencaoAutocarroDTO manutencaoAutocarroDTO) {
        try {
            ManutencaoAutocarro novaManutencaoAutocarro = manutencaoAutocarroService.criarManutencaoAutocarro(manutencaoAutocarroDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaManutencaoAutocarro);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ManutencaoAutocarro>> listarTodasManutencoesAutocarro() {
        try {
            List<ManutencaoAutocarro> manutencoesDosAutocarros = manutencaoAutocarroService.listarTodasManutencoesAutocarro();
            return ResponseEntity.ok(manutencoesDosAutocarros);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ManutencaoAutocarro> buscarManutencaoAutocarroPorId(@PathVariable Long id) {
        try {
            return manutencaoAutocarroService.buscarManutencaoAutocarroPorId(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/autocarro/{autocarroId}")
    public ResponseEntity<List<ManutencaoAutocarro>> buscarManutencoesPorAutocarroId(@PathVariable Long autocarroId) {
        try {
            List<ManutencaoAutocarro> manutencoesDoAutocarro = manutencaoAutocarroService.buscarManutencoesPorAutocarroId(autocarroId);
            return ResponseEntity.ok(manutencoesDoAutocarro);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/autocarro/{autocarroId}/agendadas")
    public ResponseEntity<List<ManutencaoAutocarro>> buscarManutencoesAgendadasPorAutocarroId(@PathVariable Long autocarroId) {
        try {
            List<ManutencaoAutocarro> manutencoesAgendadas = manutencaoAutocarroService.buscarManutencoesAgendadasPorAutocarroId(autocarroId);
            return ResponseEntity.ok(manutencoesAgendadas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ManutencaoAutocarro> atualizarManutencaoAutocarro(@PathVariable Long id, @RequestBody ManutencaoAutocarroDTO manutencaoAutocarroDTO) {
        try {
            ManutencaoAutocarro manutencaoAutocarroAtualizada = manutencaoAutocarroService.atualizarManutencaoAutocarro(id, manutencaoAutocarroDTO);
            return ResponseEntity.ok(manutencaoAutocarroAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> apagarManutencaoAutocarro(@PathVariable Long id) {
        try {
            manutencaoAutocarroService.apagarManutencaoAutocarro(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}