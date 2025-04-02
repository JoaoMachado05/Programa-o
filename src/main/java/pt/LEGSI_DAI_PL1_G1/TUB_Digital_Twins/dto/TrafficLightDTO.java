package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight.State;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record TrafficLightDTO(
        Long id,

        @NotNull(message = "A latitude não pode ser nula")
        Double latitude,

        @NotNull(message = "A longitude não pode ser nula")
        Double longitude,

        @NotNull(message = "O estado atual não pode ser nulo")
        State currentState,

        boolean operational,

        LocalDateTime lastMaintenance,

        Integer timeUntilStateChange,

        boolean inAnomaly,

        List<Stop> stops
) {
        public boolean isInAnomaly() {
                return inAnomaly;
        }

        public List<Stop> getStops() {
                return stops;
        }

        public Long getId() {
                return id;
        }
}