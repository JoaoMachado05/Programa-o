package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;
import lombok.Getter;

@Getter
public class EventoRiscoDTO {
    private final Long idParagem;
    private final String imagemBase64;
    private final String tipoRisco; // Ex: "vandalismo", "aglomeração"

    public EventoRiscoDTO(Long idParagem, String imagemBase64, String tipoRisco) {
        this.idParagem = idParagem;
        this.imagemBase64 = imagemBase64;
        // Opcional, para processamentos futuros
        this.tipoRisco = tipoRisco;
    }
}
