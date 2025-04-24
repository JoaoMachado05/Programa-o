package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Bus;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.VehiclePassage;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.BusRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.VehiclePassageRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VehicleDetectionService {

    private final BusRepository busRepository;
    private final VehiclePassageRepository vehiclePassageRepository;
    private final SimpMessagingTemplate messagingTemplate;


    public Map<String, Object> processVehicleDetection(String matricula, String vehicleType) {
        Optional<Bus> busOptional = busRepository.findByMatricula(matricula);
        boolean isAuthorized = busOptional.isPresent();

        VehiclePassage passage = new VehiclePassage();
        passage.setMatricula(matricula);
        passage.setTimestamp(LocalDateTime.now());
        passage.setAuthorized(isAuthorized);
        passage.setVehicleType(vehicleType);
        passage.setInfraction(!isAuthorized);

        if (!isAuthorized) {
            passage.setImagePath("/images/infractions/" + matricula + "_" + System.currentTimeMillis() + ".jpg");

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "unauthorized_vehicle");
            notification.put("matricula", matricula);
            notification.put("timestamp", passage.getTimestamp());
            notification.put("vehicleType", vehicleType);
            notification.put("imagePath", passage.getImagePath());

            messagingTemplate.convertAndSend("/topic/alerts/unauthorized_vehicle", notification);
        }

        VehiclePassage savedPassage = vehiclePassageRepository.save(passage);


        Map<String, Object> result = new HashMap<>();
        result.put("passageId", savedPassage.getId());
        result.put("matricula", matricula);
        result.put("timestamp", savedPassage.getTimestamp());
        result.put("authorized", isAuthorized);
        result.put("vehicleType", vehicleType);
        result.put("infraction", !isAuthorized);

        return result;
    }



    public boolean registerInfraction(Long passageId) {
        Optional<VehiclePassage> passageOptional = vehiclePassageRepository.findById(passageId);

        if (passageOptional.isEmpty() || passageOptional.get().getAuthorized()) {
            return false;
        }

        VehiclePassage passage = passageOptional.get();
        passage.setInfraction(true);
        vehiclePassageRepository.save(passage);

        // Notificar sobre a infração registrada
        messagingTemplate.convertAndSend("/topic/alerts/infraction_registered", passage.getId());

        return true;
    }
}