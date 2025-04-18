package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.AvariaSemaforo;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight;

import java.util.List;

@Repository
public interface AvariaSemaforoRepository extends JpaRepository<AvariaSemaforo, Long> {
    List<AvariaSemaforo> findBySemaforoAndResolvidaFalse(TrafficLight semaforo);
    List<AvariaSemaforo> findBySemaforoAndResolvidaTrue(TrafficLight semaforo);
    List<AvariaSemaforo> findBySemaforoIdOrderByDataReporteDesc(Long semaforoId);
}