package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "buses", uniqueConstraints = {@UniqueConstraint(columnNames = "matricula")})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String matricula;

    @Column(nullable = false)
    private Integer capacidadeMaxima;

    @Column(nullable = false)
    private Integer lotacaoAtual;

    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'Desconhecida'")
    private String linhaAtual;

    private Double velocidade;
    private Double temperaturaAtual;
    private Double latitude;
    private Double longitude;
}
