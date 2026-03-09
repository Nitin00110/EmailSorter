package com.emailsorter.emailsorter.SecurityConfigs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@EnableWebSecurity
@Configuration
public class RedirectEndPoint {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Enable CORS so the React frontend can communicate with this backend
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Disable CSRF to allow POST requests from the frontend/Postman
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Authorization Rules (Specific rules FIRST, catch-all LAST)
                .authorizeHttpRequests(authorizeRequests -> authorizeRequests
                        // Public endpoints (Login page, AI testing, Tracking pixel, and Errors)
                        .requestMatchers("/api/ai/**", "/error", "/track/**", "/home").permitAll()

                        // Catch-all: Everything else requires Google Login
                        .anyRequest().authenticated()
                )

                // 4. OAuth2 Login Configuration
                .oauth2Login(oauth2Login -> oauth2Login
                        // Redirect back to the React Frontend after successful login!
                        .defaultSuccessUrl("http://localhost:5173/", true)
                );

        return http.build();
    }

    // CORS Configuration to allow requests from your Vite/React frontend
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow the React frontend's origin (add others here if deploying to Vercel/Netlify later)
        configuration.setAllowedOriginPatterns(List.of("http://localhost:5173", "http://localhost:3000"));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));

        // CRITICAL: This allows the session cookie to be sent back and forth
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}