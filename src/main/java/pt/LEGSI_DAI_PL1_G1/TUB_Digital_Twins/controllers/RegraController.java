package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Regra;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.RegraService;

import java.util.List;

@RestController
@RequestMapping("/regras")
public class RegraController {

    private final RegraService regraService;

    @Autowired
    public RegraController(RegraService regraService) {
        this.regraService = regraService;
    }

    @PostMapping
    public ResponseEntity<Regra> adicionarRegra(@RequestBody Regra regra) {
        Regra novaRegra = regraService.adicionarRegra(regra);
        return new ResponseEntity<>(novaRegra, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> removerRegra(@PathVariable Long id) {
        String resultado = regraService.removerRegraPorId(id);
        return new ResponseEntity<>(resultado, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> editarRegra(@PathVariable Long id, @RequestBody Regra regra) {
        // Ensure the path ID matches the rule's ID
        if (!id.equals(regra.getId())) {
            return new ResponseEntity<>("ID no caminho da URL não corresponde ao ID da regra", HttpStatus.BAD_REQUEST);
        }

        String resultado = regraService.editarRegra(regra);
        return new ResponseEntity<>(resultado, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Regra> obterRegraPorId(@PathVariable Long id) {
        Regra regra = regraService.obterRegraPorId(id);

        if (regra != null) {
            return new ResponseEntity<>(regra, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<List<Regra>> listarRegras() {
        List<Regra> regras = regraService.listarRegras();
        return new ResponseEntity<>(regras, HttpStatus.OK);
    }
}