package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

public class TemperatureResponse {

    private float temperaturaAtual;
    private String acao;

    // Construtor
    public TemperatureResponse(float temperaturaAtual, String acao) {
        this.temperaturaAtual = temperaturaAtual;
        this.acao = acao;
    }

    // Getters e Setters
    public float getTemperaturaAtual() {
        return temperaturaAtual;
    }

    public void setTemperaturaAtual(float temperaturaAtual) {
        this.temperaturaAtual = temperaturaAtual;
    }

    public String getAcao() {
        return acao;
    }

    public void setAcao(String acao) {
        this.acao = acao;
    }
}
