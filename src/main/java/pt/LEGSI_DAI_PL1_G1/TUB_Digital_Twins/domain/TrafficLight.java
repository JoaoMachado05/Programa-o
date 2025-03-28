package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "traffic_lights")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrafficLight {

    public enum State {
        RED, YELLOW, GREEN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_state", nullable = false)
    private State currentState;

    @Column(nullable = false)
    private boolean operational;

    @Column(name = "last_maintenance")
    private LocalDateTime lastMaintenance;

    @Column(name = "time_until_state_change")
    private Integer timeUntilStateChange; // em segundos
}