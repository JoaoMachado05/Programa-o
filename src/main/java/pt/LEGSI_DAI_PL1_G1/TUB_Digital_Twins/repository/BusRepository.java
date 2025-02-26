package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {

    List<Bus> findByLinha(String linha);
}
