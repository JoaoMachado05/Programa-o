package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.ManutencaoAutocarro;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ManutencaoAutocarroRepository extends JpaRepository<ManutencaoAutocarro, Long> {

    List<ManutencaoAutocarro> findByAutocarroId(Long autocarroId);

    @Query("SELECT m FROM ManutencaoAutocarro m WHERE m.autocarroId = :autocarroId AND m.dataAgendada > :now ORDER BY m.dataAgendada ASC")
    List<ManutencaoAutocarro> findManutencoesAgendadasByAutocarroId(@Param("autocarroId") Long autocarroId, @Param("now") LocalDateTime now);

}
