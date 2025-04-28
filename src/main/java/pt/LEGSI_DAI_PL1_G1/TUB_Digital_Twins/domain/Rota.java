package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.FetchType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "rotas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"trafficLights", "stops"})
@EqualsAndHashCode(exclude = {"trafficLights", "stops"})
public class Rota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome da rota não pode estar vazio")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "Sentido da rota não pode estar vazio")
    @Column(nullable = false)
    private String sentido;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "route_traffic_lights",
            joinColumns = @JoinColumn(name = "route_id"),
            inverseJoinColumns = @JoinColumn(name = "traffic_light_id")
    )
    @Builder.Default
    private List<TrafficLight> trafficLights = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "route_stops",
            joinColumns = @JoinColumn(name = "route_id"),
            inverseJoinColumns = @JoinColumn(name = "stop_id")
    )
    @Builder.Default
    private List<Stop> stops = new ArrayList<>();

    public boolean addTrafficLight(TrafficLight trafficLight) {
        if (trafficLights == null) {
            trafficLights = new ArrayList<>();
        }
        return trafficLights.add(trafficLight);
    }

    public boolean removeTrafficLight(TrafficLight trafficLight) {
        if (trafficLights == null) {
            return false;
        }
        return trafficLights.remove(trafficLight);
    }

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

    public List<TrafficLight> getTrafficLights() {
        if (trafficLights == null) {
            trafficLights = new ArrayList<>();
        }
        return trafficLights;
    }

    public List<Stop> getStops() {
        if (stops == null) {
            stops = new ArrayList<>();
        }
        return stops;
    }
}