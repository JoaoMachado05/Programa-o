package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import jakarta.validation.constraints.NotNull;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight.State;

public record TrafficLightDTO(
        Long id,

        @NotNull(message = "A latitude nao pode ser nula")
        Double latitude,

        @NotNull(message = "A longitude nao pode ser nula")
        Double longitude,

        @NotNull(message = "O estado atual nao pode ser nulo")
        State currentState,

        boolean operational
) {}
