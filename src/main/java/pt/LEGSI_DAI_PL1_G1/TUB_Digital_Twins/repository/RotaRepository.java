package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Rota;

import java.util.List;
import java.util.Optional;

@Repository
public interface RotaRepository extends JpaRepository<Rota, Long> {

    Optional<Rota> findByNome(String nome);

    List<Rota> findBySentido(String sentido);

    @Query("SELECT r FROM Rota r JOIN r.stops s WHERE s.id = :stopId")
    List<Rota> findByStopId(@Param("stopId") Long stopId);

    @Query("SELECT r FROM Rota r JOIN r.trafficLights t WHERE t.id = :trafficLightId")
    List<Rota> findByTrafficLightId(@Param("trafficLightId") Long trafficLightId);


    List<Rota> findByNomeAndSentido(String nome, String sentido);

    List<Rota> findByNomeContaining(String nome);
}