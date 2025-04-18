package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.ManutencaoSemaforo;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ManutencaoSemaforoRepository extends JpaRepository<ManutencaoSemaforo, Long> {

    List<ManutencaoSemaforo> findBySemaforoId(Long semaforoId);

    List<ManutencaoSemaforo> findBySemaforoIdAndDataAgendadaAfter(Long semaforoId, LocalDateTime dataReferencia);
}