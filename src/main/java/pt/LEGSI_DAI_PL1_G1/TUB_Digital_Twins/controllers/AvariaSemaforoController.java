package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.CriarAvariaSemaforoDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.AvariaSemaforoDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.AvariaSemaforoService;

import java.util.List;

@RestController
@RequestMapping("/traffic-lights")
@RequiredArgsConstructor
public class AvariaSemaforoController {

    private final AvariaSemaforoService avariaSemaforoService;

    @PostMapping("/{semaforoId}/avarias")
    public ResponseEntity<AvariaSemaforoDTO> registarAvaria(
            @PathVariable Long semaforoId,
            @RequestBody CriarAvariaSemaforoDTO dto) {
        return ResponseEntity.ok(avariaSemaforoService.registarAvaria(semaforoId, dto));
    }

    @GetMapping("/{semaforoId}/avarias")
    public ResponseEntity<List<AvariaSemaforoDTO>> obterHistoricoAvariasSemaforo(
            @PathVariable Long semaforoId) {
        return ResponseEntity.ok(avariaSemaforoService.obterHistoricoAvariasSemaforo(semaforoId));
    }

    @GetMapping("/{semaforoId}/avarias/ativas")
    public ResponseEntity<List<AvariaSemaforoDTO>> obterAvariasAtivasSemaforo(
            @PathVariable Long semaforoId) {
        return ResponseEntity.ok(avariaSemaforoService.obterAvariasAtivasSemaforo(semaforoId));
    }

    @GetMapping("/{semaforoId}/avarias/resolvidas")
    public ResponseEntity<List<AvariaSemaforoDTO>> obterAvariasResolvidasSemaforo(
            @PathVariable Long semaforoId) {
        return ResponseEntity.ok(avariaSemaforoService.obterAvariasResolvidasSemaforo(semaforoId));
    }

    @PutMapping("/avarias/{avariaId}/resolver")
    public ResponseEntity<AvariaSemaforoDTO> resolverAvaria(
            @PathVariable Long avariaId) {
        return ResponseEntity.ok(avariaSemaforoService.resolverAvaria(avariaId));
    }
}