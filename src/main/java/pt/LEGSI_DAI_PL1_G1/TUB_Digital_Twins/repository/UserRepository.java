package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
