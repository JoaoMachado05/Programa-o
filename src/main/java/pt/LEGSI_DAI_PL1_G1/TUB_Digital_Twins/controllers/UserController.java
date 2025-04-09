package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.UserDTO;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (userService.validateCredentials(email, password)) {
            request.getSession().setAttribute("user", email);
            return ResponseEntity.ok("Login com sucesso");
        }

        return ResponseEntity.status(401).body("Credenciais inválidas");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        request.getSession().invalidate();
        return ResponseEntity.ok("Logout feito com sucesso");
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().build();
        }

        if (userService.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).build(); // email ja existe
        }

        UserDTO newUser = userService.createUser(email, password);
        return ResponseEntity.ok(newUser);
    }


}

