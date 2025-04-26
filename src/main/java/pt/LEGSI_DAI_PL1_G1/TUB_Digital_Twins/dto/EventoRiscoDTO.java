package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;
import lombok.Getter;

@Getter
public class EventoRiscoDTO {
    private  Long idParagem ;
    private String imagemBase64;
    private String tipoRisco; // Ex: "vandalismo", "aglomeração"

    public EventoRiscoDTO() {
        this.idParagem = idParagem;
        this.imagemBase64 = imagemBase64;
        // Opcional, para processamentos futuros
        this.tipoRisco = tipoRisco;
    }

    public void setIdParagem(long l) {
    }

    public void setTipoRisco(String vandalismo) {
    }

}
