package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.BusDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.BusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/buses")
public class BusController {
    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    // Criar um novo autocarro
    @PostMapping
    public ResponseEntity<BusDTO> createBus(@RequestBody BusDTO busDTO) {
        BusDTO savedBus = busService.createBus(busDTO);
        return ResponseEntity.ok(savedBus);
    }

    // Obter todos os autocarros
    @GetMapping
    public ResponseEntity<List<BusDTO>> getAllBuses() {
        List<BusDTO> buses = busService.getAllBuses();
        return ResponseEntity.ok(buses);
    }

    // Obter um autocarro por ID
    @GetMapping("/{id}")
    public ResponseEntity<BusDTO> getBusById(@PathVariable Long id) {
        Optional<BusDTO> busDTO = busService.getBusById(id);
        return busDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Atualizar um autocarro
    @PutMapping("/{id}")
    public ResponseEntity<BusDTO> updateBus(@PathVariable Long id,@RequestBody BusDTO busDTO) {
        Optional<BusDTO> updatedBus = busService.updateBus(id, busDTO);
        return updatedBus.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Remover um autocarro
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable Long id) {
        boolean deleted = busService.deleteBus(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
