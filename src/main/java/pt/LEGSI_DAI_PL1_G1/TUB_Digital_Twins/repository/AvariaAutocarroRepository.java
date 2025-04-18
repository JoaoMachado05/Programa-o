package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.AvariaAutocarro;

import java.util.List;

@Repository
public interface AvariaAutocarroRepository extends JpaRepository<AvariaAutocarro, Long> {

    List<AvariaAutocarro> findByAutocarroId(Long autocarroId);

    @Query("SELECT a FROM AvariaAutocarro a WHERE a.autocarro.id = :autocarroId AND a.resolvida = false")
    List<AvariaAutocarro> findAvariasAtivasByAutocarroId(@Param("autocarroId") Long autocarroId);

    @Query("SELECT a FROM AvariaAutocarro a WHERE a.autocarro.id = :autocarroId AND a.resolvida = true")
    List<AvariaAutocarro> findAvariasResolvidasByAutocarroId(@Param("autocarroId") Long autocarroId);
}