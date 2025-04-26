package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;
import jakarta.persistence.FetchType;
import jakarta.persistence.CascadeType;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

/**
 * Entidade que representa um semáforo no sistema.
 */
@Entity
@Table(name = "traffic_lights")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "stops")
@EqualsAndHashCode(exclude = "stops")
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

    @Column(name = "is_in_anomaly", nullable = false)
    private boolean inAnomaly = false;

    @OneToMany(mappedBy = "trafficLight", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Stop> stops = new ArrayList<>();

    // 🟢 NOVOS CAMPOS USADOS PELO IntelligentTrafficLightService:

    @Column(name = "green_time")
    private Integer greenTime;

    @Column(name = "red_time")
    private Integer redTime;

    @Column(name = "yellow_time")
    private Integer yellowTime;

    @Builder.Default
    @Column(name = "brt_priority_active")
    private Boolean brtPriorityActive = false;

    @Column(name = "priority_bus_id")
    private Long priorityBusId;

    public boolean addStop(Stop stop) {
        if (stops == null) {
            stops = new ArrayList<>();
        }
        return stops.add(stop);
    }

    public boolean removeStop(Stop stop) {
        if (stops == null) {
            return false;
        }
        return stops.remove(stop);
    }

    public List<Stop> getStops() {
        if (stops == null) {
            stops = new ArrayList<>();
        }
        return stops;
    }

    public void tick() {
        if (timeUntilStateChange > 0) {
            timeUntilStateChange--;
        }

        if (timeUntilStateChange == 0) {
            switch (currentState) {
                case GREEN -> {
                    currentState = State.YELLOW;
                    timeUntilStateChange = (yellowTime != null) ? yellowTime : 3;
                }
                case YELLOW -> {
                    currentState = State.RED;
                    timeUntilStateChange = (redTime != null) ? redTime : 10;
                }
                case RED -> {
                    currentState = State.GREEN;
                    timeUntilStateChange = (greenTime != null) ? greenTime : 15;
                }
            }
        }
    }


}