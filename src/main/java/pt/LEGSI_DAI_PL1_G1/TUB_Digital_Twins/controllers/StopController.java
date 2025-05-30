package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import jakarta.validation.Valid;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.AnomalyMonitorService;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.StopService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/stops")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StopController {

    private final StopService stopService;
    private final AnomalyMonitorService anomalyMonitorService;

    @GetMapping
    public List<StopDTO> getAllStops() {
        return stopService.getAllStops();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StopDTO> getStopById(@PathVariable Long id) {
        Optional<StopDTO> stopDTO = stopService.getStopById(id);
        return stopDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StopDTO> createStop(@RequestBody StopDTO stopDTO) {
        StopDTO createdStop = stopService.createStop(stopDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStop);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<StopDTO> updateStop(@PathVariable Long id, @RequestBody StopDTO stopDTO) {
        StopDTO updatedStop = stopService.updateStop(id, stopDTO);
        if (updatedStop != null) {
            return ResponseEntity.ok(updatedStop);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStop(@PathVariable Long id) {
        boolean deleted = stopService.deleteStop(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/percentagem-ocupacao")
    public ResponseEntity<Double> getStopOccupancyPercentage(@PathVariable Long id) {
        Optional<Double> percentage = stopService.getStopOccupancyPercentage(id);
        return percentage.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/tempo-proximo-autocarro")
    public ResponseEntity<Integer> getStopTempoProximoAutocarro(@PathVariable Long id) {
        Optional<Integer> tempo = stopService.getTempoAteProximoAutocarro(id);
        return tempo.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/monitorizar-risco")
    public ResponseEntity<String> monitorizarRisco(@RequestBody EventoRiscoDTO evento) {
        String resultado = anomalyMonitorService.processarEventoRisco(evento);
        return ResponseEntity.ok(resultado);
    }

    @PatchMapping("/atualizar-ocupacao/{id}")
    public ResponseEntity<StopDTO> atualizarOcupacao(
            @PathVariable Long id,
            @RequestBody int numPessoas) {

        StopDTO stopAtualizado = stopService.atualizarPessoas(id, numPessoas);
        return ResponseEntity.ok(stopAtualizado);
    }

    @PostMapping("/{id}/validar-bilhete")
    public ResponseEntity<StopDTO> validarBilhete(@PathVariable Long id) {
        Optional<StopDTO> updatedStop = stopService.validarBilhete(id);

        return updatedStop
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/chegada-autocarro")
    public ResponseEntity<Map<String, Object>> processarChegadaAutocarro(
            @RequestBody ChegadaAutocarroDTO chegadaDTO) {

        Optional<Map<String, Object>> resultado = stopService.processarChegadaAutocarro(chegadaDTO);

        return resultado
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/proximo-autocarro")
    public ResponseEntity<BusDTO> getNextBus(@PathVariable Long id) {

        Optional<BusDTO> nextBusOpt = stopService.getNextBus(id);

        return nextBusOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    /*
    @PostMapping("/{id}/risco")
    public ResponseEntity<String> monitorizarRiscoParagem(
             @PathVariable Long id,
            @RequestBody RiscoParagemDTO dto) {
        dto = RiscoParagemDTO.builder()
            .stopId(id)
            .tipoRisco(dto.tipoRisco())
            .imagemBase64(dto.imagemBase64())
            .build();

    anomalyMonitorService.processarRisco(dto);
    return ResponseEntity.ok("Processamento de risco concluído para paragem " + id);
    }*/
    @PutMapping("/{id}")
    public ResponseEntity<AtualizarParagemResponse> atualizarParagem(
            @PathVariable Long id,
            @RequestBody AtualizarParagemRequest dados) {

        return stopService.processarAtualizacaoParagem(id, dados)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
