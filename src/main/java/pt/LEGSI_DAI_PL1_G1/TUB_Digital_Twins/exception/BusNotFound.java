package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.exception;

public class BusNotFound extends RuntimeException {
    public BusNotFound(String message) {
        super(message);
    }

    public  BusNotFound(){
        super("Autocarro não encontrado.");
    }
}
