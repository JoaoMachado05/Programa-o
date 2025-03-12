package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight.State;

public record TrafficLightDTO(
        Long id,

        @NotBlank(message = "A localização não pode estar vazia")
        String location,

        @NotNull(message = "O estado atual não pode ser nulo")
        State currentState,

        boolean operational
) {}
