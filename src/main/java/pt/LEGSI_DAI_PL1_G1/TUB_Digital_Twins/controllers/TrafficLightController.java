package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trafficlights")
@Slf4j
@RequiredArgsConstructor
public class TrafficLightController {

    private final Map<String, TrafficLight> trafficLights = new HashMap<>();

    @GetMapping
    public ResponseEntity<List<TrafficLight>> getAllTrafficLights() {
        log.info("Retrieving all traffic lights");
        return ResponseEntity.ok(new ArrayList<>(trafficLights.values()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrafficLight> getTrafficLight(@PathVariable String id) {
        log.info("Retrieving traffic light with id: {}", id);
        TrafficLight trafficLight = trafficLights.get(id);
        if (trafficLight == null) {
            log.warn("Traffic light with id {} not found", id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(trafficLight);
    }

    @PostMapping
    public ResponseEntity<TrafficLight> createTrafficLight(@RequestBody TrafficLight trafficLight) {
        log.info("Creating new traffic light at location: {}", trafficLight.getLocation());

        if (trafficLight.getId() == null || trafficLight.getId().isEmpty()) {
            log.warn("Traffic light id cannot be null or empty");
            return ResponseEntity.badRequest().build();
        }

        trafficLights.put(trafficLight.getId(), trafficLight);
        log.debug("Traffic light created successfully: {}", trafficLight);
        return new ResponseEntity<>(trafficLight, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrafficLight> updateTrafficLight(
            @PathVariable String id,
            @RequestBody TrafficLight updatedTrafficLight) {

        log.info("Updating traffic light with id: {}", id);

        if (!trafficLights.containsKey(id)) {
            log.warn("Traffic light with id {} not found for update", id);
            return ResponseEntity.notFound().build();
        }

        updatedTrafficLight.setId(id);
        trafficLights.put(id, updatedTrafficLight);
        log.debug("Traffic light updated successfully: {}", updatedTrafficLight);
        return ResponseEntity.ok(updatedTrafficLight);
    }

    @PatchMapping("/{id}/state")
    public ResponseEntity<TrafficLight> changeTrafficLightState(
            @PathVariable String id,
            @RequestParam TrafficLight.State state) {

        log.info("Changing state of traffic light {} to {}", id, state);

        TrafficLight trafficLight = trafficLights.get(id);
        if (trafficLight == null) {
            log.warn("Traffic light with id {} not found", id);
            return ResponseEntity.notFound().build();
        }

        if (!trafficLight.isOperational()) {
            log.warn("Cannot change state of non-operational traffic light: {}", id);
            return ResponseEntity.badRequest().body(trafficLight);
        }

        trafficLight.setCurrentState(state);
        log.debug("Traffic light state changed successfully: {}", trafficLight);
        return ResponseEntity.ok(trafficLight);
    }

    @PatchMapping("/{id}/operational")
    public ResponseEntity<TrafficLight> setTrafficLightOperational(
            @PathVariable String id,
            @RequestParam boolean operational) {

        log.info("Setting operational status of traffic light {} to {}", id, operational);

        TrafficLight trafficLight = trafficLights.get(id);
        if (trafficLight == null) {
            log.warn("Traffic light with id {} not found", id);
            return ResponseEntity.notFound().build();
        }

        trafficLight.setOperational(operational);
        log.debug("Traffic light operational status changed successfully: {}", trafficLight);
        return ResponseEntity.ok(trafficLight);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrafficLight(@PathVariable String id) {
        log.info("Deleting traffic light with id: {}", id);

        if (!trafficLights.containsKey(id)) {
            log.warn("Traffic light with id {} not found for deletion", id);
            return ResponseEntity.notFound().build();
        }

        trafficLights.remove(id);
        log.debug("Traffic light with id {} deleted successfully", id);
        return ResponseEntity.noContent().build();
    }
}