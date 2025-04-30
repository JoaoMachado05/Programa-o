package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "riscos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Riscos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paragem_id")
    private Stop paragem;

    @Column(name = "gravidade", nullable = false)
    private Integer gravidade; // 1-3 (1: grave, 2: moderada, 3: leve)

    @Column(name = "tipo", nullable = false, length = 100)
    private String tipo;

    @Column(name = "data_reporte", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime dataReporte;

    @Column(name = "data_resolucao", columnDefinition = "DATETIME")
    private LocalDateTime dataResolucao;

    @Column(name = "resolvida", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean resolvida;
}