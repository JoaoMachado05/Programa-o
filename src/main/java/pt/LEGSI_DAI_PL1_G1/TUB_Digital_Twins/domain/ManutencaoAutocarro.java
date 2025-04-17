package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "manutencao_autocarro")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManutencaoAutocarro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "autocarro_id", nullable = false)
    private Long autocarroId;

    @Column(name = "data_agendada", nullable = false)
    private LocalDateTime dataAgendada;

    @Column(name = "descricao", length = 500)
    private String descricao;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    public ManutencaoAutocarro(Long autocarroId, LocalDateTime dataAgendada, String descricao) {
        this.autocarroId = autocarroId;
        this.dataAgendada = dataAgendada;
        this.descricao = descricao;
        this.dataCriacao = LocalDateTime.now();
    }
}