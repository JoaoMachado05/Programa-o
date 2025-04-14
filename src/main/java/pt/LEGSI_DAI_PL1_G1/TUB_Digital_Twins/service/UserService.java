package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import org.springframework.stereotype.Service;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.User;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.UserDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.UserRepository;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<UserDTO> findByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(user -> new UserDTO(user.getId(), user.getEmail()));
    }

    public boolean validateCredentials(String email, String password) {
        return userRepository.findByEmail(email)
                .map(user -> user.getPassword().equals(password))
                .orElse(false);
    }

    public UserDTO createUser(String email, String password) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(password); // Em produção, deverias encriptar!
        User saved = userRepository.save(user);
        return new UserDTO(saved.getId(), saved.getEmail());
    }

    /*public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserDTO(u.getId(), u.getEmail()))
                .toList();
    }*/

}
