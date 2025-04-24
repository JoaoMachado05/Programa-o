package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_passages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehiclePassage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String matricula;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Boolean authorized;

    @Column
    private String vehicleType;

    @Column
    private String imagePath;

    @Column
    private Boolean infraction;
}
