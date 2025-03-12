package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;


@Component
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrafficLight {

    public enum State {
        RED, YELLOW, GREEN
    }

    private String id;
    private String location;
    private State currentState;
    private boolean operational;

    // Construtor personalizado com valores padrão
    public TrafficLight(String location) {
        this.location = location;
        this.currentState = State.RED;
        this.operational = true;
    }
}