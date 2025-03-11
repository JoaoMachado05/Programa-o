package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Bus;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.BusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClimaService {
    private final BusRepository busRepository;

    public void ajustarArCondicionado(Long busId, boolean ligar, Double temperaturaAlvo) {
        Optional<Bus> busOpt = busRepository.findById(busId);
        if (busOpt.isPresent()) {
            Bus bus = busOpt.get();
            bus.setArCondicionadoLigado(ligar);

            // Aqui meter para enviar comando para ligar/desligar o ar condicionado

            busRepository.save(bus);
        }
    }
}