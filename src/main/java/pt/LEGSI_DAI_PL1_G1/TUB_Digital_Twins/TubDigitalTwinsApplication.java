package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TubDigitalTwinsApplication {

	public static void main(String[] args) {
		SpringApplication.run(TubDigitalTwinsApplication.class, args);
	}

}