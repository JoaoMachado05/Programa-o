package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.exception;

public class TrafficLightNotFound extends RuntimeException {
    public TrafficLightNotFound(String message) {
        super(message);
    }
    public  TrafficLightNotFound() {
        super("Semáforo não encontrado.");
    }
}
