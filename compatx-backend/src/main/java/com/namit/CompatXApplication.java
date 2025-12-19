package com.namit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@EnableAsync
@SpringBootApplication
public class CompatXApplication {

	public static void main(String[] args) {
		SpringApplication.run(CompatXApplication.class, args);

	}

}
