// package com.example.demo;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;

// @Configuration
// public class SecurityConfig {

//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         http
//                 .cors().and()
//                 .csrf().disable()
//                 .authorizeHttpRequests()
//                 // allow unauthenticated access to auth + CRUD endpoints for development
//                 .requestMatchers("/api/auth/**").permitAll()
//                 .requestMatchers(
//                         "/api/savings", "/api/savings/**",
//                         "/api/incomes", "/api/incomes/**",
//                         "/api/users", "/api/users/**",
//                         "/api/expenses", "/api/expenses/**",
//                         "/api/alerts", "/api/alerts/**")
//                 .permitAll()
//                 // keep other endpoints authenticated if present
//                 .anyRequest().authenticated();

//         return http.build();
//     }
// }

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
                .csrf().disable()
                .authorizeHttpRequests()
                // allow unauthenticated access to auth + CRUD endpoints for development
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/savings/**", "/api/incomes/**", "/api/users/**", "/api/expenses/**",
                        "/api/alerts/**")
                .permitAll()
                // keep other endpoints authenticated if present
                .anyRequest().authenticated();

        return http.build();
    }
}
