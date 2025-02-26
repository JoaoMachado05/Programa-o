package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "buses")
@Getter
@Setter
@NoArgsConstructor
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String linha;

    @Column(nullable = false)
    private int passageiros;

    @Column(nullable = false)
    private double velocidade;

    @Column(nullable = false)
    private double temperatura;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;
}
