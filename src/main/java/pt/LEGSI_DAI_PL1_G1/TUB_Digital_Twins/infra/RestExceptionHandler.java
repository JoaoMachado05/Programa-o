package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.infra;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;
import java.util.HashMap;
import java.util.Map;

import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.exception.BusAlreadyExists;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.exception.BusNotFound;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.exception.TrafficLightNotFound;

@ControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(BusNotFound.class)
    public ResponseEntity<ErrorResponse> handleBusNotFound(BusNotFound ex) {
        ErrorResponse error = new ErrorResponse("Bus Not Found", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BusAlreadyExists.class)
    public ResponseEntity<ErrorResponse> handleBusAlreadyExists(BusAlreadyExists ex) {
        ErrorResponse error = new ErrorResponse("Bus Already Exists", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(TrafficLightNotFound.class)
    public ResponseEntity<ErrorResponse> handleTrafficLightNotFound(TrafficLightNotFound ex) {
        ErrorResponse error = new ErrorResponse("Traffic Light Not Found", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }
    /*
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        ErrorResponse error = new ErrorResponse("Unexpected Error", "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    */


    // Classe interna para padronizar respostas de erro
    @Getter
    @Setter
    public static class ErrorResponse {
        // Getters e setters
        private String title;
        private String message;

        public ErrorResponse(String title, String message) {
            this.title = title;
            this.message = message;
        }
    }
}