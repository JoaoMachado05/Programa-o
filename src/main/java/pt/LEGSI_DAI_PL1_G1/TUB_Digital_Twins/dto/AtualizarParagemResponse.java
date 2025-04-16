package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;
import java.util.List;
public record AtualizarParagemResponse (
        Long idParagem,
        Integer lotacaoAtual,
        List<String> horariosSugeridos
){}
