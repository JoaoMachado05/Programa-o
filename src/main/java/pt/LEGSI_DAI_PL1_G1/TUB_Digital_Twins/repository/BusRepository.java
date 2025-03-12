package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {

    Optional<Bus> findByMatricula(String matricula);

    List<Bus> findByLinhaAtual(String linhaAtual);

    List<Bus> findByCapacidadeMaximaGreaterThanEqual(Integer capacidade);
}