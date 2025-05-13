package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Rota;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Stop;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.TrafficLight;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.RotaRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.StopRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.TrafficLightRepository;

import java.util.*;
import java.util.Optional;

@Service
public class RotaService {

    private final RotaRepository rotaRepository;
    private final StopRepository stopRepository;
    private final TrafficLightRepository trafficLightRepository;

    @Autowired
    public RotaService(
            RotaRepository rotaRepository,
            StopRepository stopRepository,
            TrafficLightRepository trafficLightRepository) {
        this.rotaRepository = rotaRepository;
        this.stopRepository = stopRepository;
        this.trafficLightRepository = trafficLightRepository;
    }


    public List<Rota> getAllRotas() {
        return rotaRepository.findAll();
    }

    public Rota getRotaById(Long id) {
        return rotaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rota não encontrada com ID: " + id));
    }

    public List<Rota> getRotasBySentido(String sentido) {
        return rotaRepository.findBySentido(sentido);
    }

    public Optional<Rota> getRotaByNome(String nome) {
        return rotaRepository.findByNome(nome);
    }

    public List<Rota> getRotasByStopId(Long stopId) {
        return rotaRepository.findByStopId(stopId);
    }

    public List<Rota> getRotasByTrafficLightId(Long trafficLightId) {
        return rotaRepository.findByTrafficLightId(trafficLightId);
    }

    @Transactional
    public Rota createRota(Rota route) {
        return rotaRepository.save(route);
    }

    @Transactional
    public Rota updateRota(Long id, Rota routeDetails) {
        Rota rota = getRotaById(id);

        rota.setNome(routeDetails.getNome());
        rota.setSentido(routeDetails.getSentido());

        // Mantém as relações existentes se não forem fornecidas
        if (routeDetails.getTrafficLights() != null && !routeDetails.getTrafficLights().isEmpty()) {
            rota.setTrafficLights(routeDetails.getTrafficLights());
        }

        if (routeDetails.getStops() != null && !routeDetails.getStops().isEmpty()) {
            rota.setStops(routeDetails.getStops());
        }

        return rotaRepository.save(rota);
    }

    @Transactional
    public void deleteRota(Long id) {
        Rota rota = getRotaById(id);
        rotaRepository.delete(rota);
    }

    @Transactional
    public Rota addStopToRota(Long routeId, Long stopId) {
        Rota rota = getRotaById(routeId);
        Stop stop = stopRepository.findById(stopId)
                .orElseThrow(() -> new EntityNotFoundException("Paragem não encontrada com ID: " + stopId));

        rota.addStop(stop);
        return rotaRepository.save(rota);
    }

    @Transactional
    public Rota removeStopFromRota(Long routeId, Long stopId) {
        Rota route = getRotaById(routeId);
        Stop stop = stopRepository.findById(stopId)
                .orElseThrow(() -> new EntityNotFoundException("Paragem não encontrada com ID: " + stopId));

        route.removeStop(stop);
        return rotaRepository.save(route);
    }

    @Transactional
    public Rota addTrafficLightToRota(Long routeId, Long trafficLightId) {
        Rota rota = getRotaById(routeId);
        TrafficLight trafficLight = trafficLightRepository.findById(trafficLightId)
                .orElseThrow(() -> new EntityNotFoundException("Semáforo não encontrado com ID: " + trafficLightId));

        rota.addTrafficLight(trafficLight);
        return rotaRepository.save(rota);
    }

    @Transactional
    public Rota removeTrafficLightFromRota(Long rotaId, Long trafficLightId) {
        Rota rota = getRotaById(rotaId);
        TrafficLight trafficLight = trafficLightRepository.findById(trafficLightId)
                .orElseThrow(() -> new EntityNotFoundException("Semáforo não encontrado com ID: " + trafficLightId));

        rota.removeTrafficLight(trafficLight);
        return rotaRepository.save(rota);
    }


    public Optional<Rota> definirOrdemParagens(Long rotaId, List<Long> stopIds) {
        Optional<Rota> rotaOptional = rotaRepository.findById(rotaId);

        if (rotaOptional.isEmpty()) {
            return Optional.empty();
        }

        Rota rota = rotaOptional.get();

        // Limpar lista atual de paragens
        rota.getStops().clear();

        // Adicionar paragens na ordem especificada
        List<Stop> novasParagens = new ArrayList<>();
        for (Long stopId : stopIds) {
            Optional<Stop> stopOptional = stopRepository.findById(stopId);
            if (stopOptional.isPresent()) {
                novasParagens.add(stopOptional.get());
            }
        }

        // Atualizar a lista de paragens na rota
        rota.getStops().addAll(novasParagens);

        // Salvar a rota atualizada
        return Optional.of(rotaRepository.save(rota));
    }

    public Optional<Rota> getRotaByNomeAndSentido(String nome, String sentido) {
        return rotaRepository.findByNomeAndSentido(nome, sentido);
    }


    public Optional<Stop> determinarProximaParagem(Long rotaId, Long paragemAtualId) {
        // 1. Buscar a rota pelo ID
        Optional<Rota> rotaOptional = rotaRepository.findById(rotaId);

        if (rotaOptional.isEmpty()) {
            return Optional.empty(); // Rota não encontrada
        }

        Rota rota = rotaOptional.get();
        List<Stop> paragens = rota.getStops();

        // Verifica se a lista de paragens não está vazia
        if (paragens.isEmpty()) {
            return Optional.empty(); // Não há paragens nesta rota
        }

        // 2. Encontrar o índice da paragem atual na lista de paragens da rota
        int indiceAtual = -1;
        for (int i = 0; i < paragens.size(); i++) {
            if (paragens.get(i).getId().equals(paragemAtualId)) {
                indiceAtual = i;
                break;
            }
        }

        // Se a paragem atual não for encontrada na rota ou for a última
        if (indiceAtual == -1 || indiceAtual >= paragens.size() - 1) {
            return Optional.empty(); // Não há próxima paragem
        }

        // 3. Obter a próxima paragem
        return Optional.of(paragens.get(indiceAtual + 1));
    }

    public Optional<Stop> determinarProximaParagem(String rotaNome, String sentido, Long paragemAtualId) {
        // 1. Buscar a rota pelo nome e sentido
        Optional<Rota> rotaOptional = rotaRepository.findByNomeAndSentido(rotaNome, sentido);

        if (rotaOptional.isEmpty()) {
            return Optional.empty(); // Rota não encontrada
        }

        Rota rota = rotaOptional.get();

        // 2. Usar o método que determina a próxima paragem por ID da rota
        return determinarProximaParagem(rota.getId(), paragemAtualId);
    }
}