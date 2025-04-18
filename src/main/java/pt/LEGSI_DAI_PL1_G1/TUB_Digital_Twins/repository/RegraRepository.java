package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Regra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegraRepository extends JpaRepository<Regra, Long> {

}