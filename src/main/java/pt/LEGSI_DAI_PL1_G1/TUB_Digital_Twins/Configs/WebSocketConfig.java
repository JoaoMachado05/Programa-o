package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.Configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto.AtualizacaoLotacaoDTO;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint principal para ligação WebSocket
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                .withSockJS(); // SockJS fallback
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // Cliente subscreve: /topic/brts, /topic/stops, /topic/trafficlights
        config.setApplicationDestinationPrefixes("/app"); // Cliente envia: /app/alguma-coisa
    }
}
