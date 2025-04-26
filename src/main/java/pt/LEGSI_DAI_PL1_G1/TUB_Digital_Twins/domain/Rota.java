package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rotas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @ManyToMany(mappedBy = "rotas")
    private List<Bus> buses = new ArrayList<>(); // Relacionamento com os autocarros

    @ManyToMany
    @JoinTable(
            name = "rota_paragem",
            joinColumns = @JoinColumn(name = "rota_id"),
            inverseJoinColumns = @JoinColumn(name = "stop_id")
    )
    private List<Stop> paragens = new ArrayList<>(); // Relacionamento com as paragens

    // Métodos e construtores necessários
}

