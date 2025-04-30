package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.CriarRiscosDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.RiscosDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.RiscosService;

import java.util.List;

@RestController
@RequestMapping("/stops")
@RequiredArgsConstructor
public class RiscosController {

    private final RiscosService riscosService;

    @PostMapping("/{paragemId}/riscos")
    public ResponseEntity<RiscosDTO> registarRisco(
            @PathVariable Long paragemId,
            @RequestBody CriarRiscosDTO dto) {
        return ResponseEntity.ok(riscosService.registarRisco(paragemId, dto));
    }

    @GetMapping("/{paragemId}/riscos")
    public ResponseEntity<List<RiscosDTO>> obterHistoricoRiscosParagem(
            @PathVariable Long paragemId) {
        return ResponseEntity.ok(riscosService.obterHistoricoRiscosParagem(paragemId));
    }

    @GetMapping("/{paragemId}/riscos/ativos")
    public ResponseEntity<List<RiscosDTO>> obterRiscosAtivosParagem(
            @PathVariable Long paragemId) {
        return ResponseEntity.ok(riscosService.obterRiscosAtivosParagem(paragemId));
    }

    @GetMapping("/{paragemId}/riscos/resolvidos")
    public ResponseEntity<List<RiscosDTO>> obterRiscosResolvidosParagem(
            @PathVariable Long paragemId) {
        return ResponseEntity.ok(riscosService.obterRiscosResolvidosParagem(paragemId));
    }

    @PutMapping("/riscos/{riscoId}/resolver")
    public ResponseEntity<RiscosDTO> resolverRisco(
            @PathVariable Long riscoId) {
        return ResponseEntity.ok(riscosService.resolverRisco(riscoId));
    }
}