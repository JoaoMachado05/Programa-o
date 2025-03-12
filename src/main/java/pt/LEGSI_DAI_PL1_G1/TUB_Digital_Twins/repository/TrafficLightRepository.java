package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight;

@Repository
public interface TrafficLightRepository extends JpaRepository<TrafficLight, String> {

}