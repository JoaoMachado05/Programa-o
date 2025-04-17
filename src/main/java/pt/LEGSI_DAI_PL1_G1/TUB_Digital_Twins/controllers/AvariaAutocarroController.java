package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.CriarAvariaAutocarroDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.AvariaAutocarroDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.AvariaAutocarroService;

import java.util.List;

@RestController
@RequestMapping("/brts")
@RequiredArgsConstructor
public class AvariaAutocarroController {

    private final AvariaAutocarroService avariaAutocarroService;

    @PostMapping("/{autocarroId}/avarias")
    public ResponseEntity<AvariaAutocarroDTO> registarAvaria(
            @PathVariable Long autocarroId,
            @RequestBody CriarAvariaAutocarroDTO dto) {
        return ResponseEntity.ok(avariaAutocarroService.registarAvaria(autocarroId, dto));
    }

    @GetMapping("/{autocarroId}/avarias")
    public ResponseEntity<List<AvariaAutocarroDTO>> obterHistoricoAvariasAutocarro(
            @PathVariable Long autocarroId) {
        return ResponseEntity.ok(avariaAutocarroService.obterHistoricoAvariasAutocarro(autocarroId));
    }

    @GetMapping("/{autocarroId}/avarias/ativas")
    public ResponseEntity<List<AvariaAutocarroDTO>> obterAvariasAtivasAutocarro(
            @PathVariable Long autocarroId) {
        return ResponseEntity.ok(avariaAutocarroService.obterAvariasAtivasAutocarro(autocarroId));
    }

    @GetMapping("/{autocarroId}/avarias/resolvidas")
    public ResponseEntity<List<AvariaAutocarroDTO>> obterAvariasResolvidasAutocarro(
            @PathVariable Long autocarroId) {
        return ResponseEntity.ok(avariaAutocarroService.obterAvariasResolvidasAutocarro(autocarroId));
    }

    @PutMapping("/avarias/{avariaId}/resolver")
    public ResponseEntity<AvariaAutocarroDTO> resolverAvaria(
            @PathVariable Long avariaId) {
        return ResponseEntity.ok(avariaAutocarroService.resolverAvaria(avariaId));
    }
}