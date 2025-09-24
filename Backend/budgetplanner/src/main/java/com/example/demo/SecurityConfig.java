package com.example.demo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors().and()
                .csrf().disable() // GETs aren't affected, but keep disabled for dev
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // allow everything while developing
                )
                .httpBasic().disable() // disable default basic auth/login form
                .formLogin().disable();

        return http.build();
    }
}
