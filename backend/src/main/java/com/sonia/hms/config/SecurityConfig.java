package com.sonia.hms.config;

import com.sonia.hms.security.HospitalUserDetailsService;
import com.sonia.hms.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final HospitalUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, HospitalUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/actuator/health",
                                "/actuator/info"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/queue/board").permitAll()
                        .requestMatchers("/api/admin/**", "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/doctors", "/api/doctors/{id}").authenticated()
                        .requestMatchers("/api/doctors/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.POST, "/api/appointments").hasAnyRole("ADMIN", "RECEPTIONIST", "PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/slots").authenticated()
                        .requestMatchers("/api/queue/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")
                        .requestMatchers("/api/patients/**").hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR")
                        .requestMatchers("/api/appointments/**").authenticated()
                        .requestMatchers("/api/dashboard/**", "/api/reports/**").authenticated()
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
