package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Riscos;

import java.util.List;

@Repository
public interface RiscosRepository extends JpaRepository<Riscos, Long> {

    List<Riscos> findByParagemId(Long paragemId);

    List<Riscos> findByParagemIdAndResolvida(Long paragemId, boolean resolvida);
}