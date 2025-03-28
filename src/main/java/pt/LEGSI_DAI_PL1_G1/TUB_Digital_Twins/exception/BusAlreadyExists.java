package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.exception;

public class BusAlreadyExists extends RuntimeException {
    public BusAlreadyExists(String message) {
        super(message);
    }

    public BusAlreadyExists(){
        super("O autocarro já existe.");
    }
}
