package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.VehiclePassage;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VehiclePassageRepository extends JpaRepository<VehiclePassage, Long> {
    List<VehiclePassage> findByMatricula(String matricula);
    List<VehiclePassage> findByAuthorizedFalse();
    List<VehiclePassage> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}