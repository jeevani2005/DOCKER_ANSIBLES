package com.example.demo.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // GET http://localhost:2005/api/users
    @GetMapping
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("name", u.getName());
                    m.put("email", u.getEmail());
                    return m;
                })
                .collect(Collectors.toList());
    }

    // optional: GET http://localhost:2005/api/users/all
    @GetMapping("/all")
    public List<Map<String, Object>> getAllUsersAlt() {
        return getAllUsers();
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("name"))
            user.setName(updates.get("name"));
        if (updates.containsKey("email"))
            user.setEmail(updates.get("email"));
        if (updates.containsKey("password") && !updates.get("password").isEmpty()) {
            String hashed = new BCryptPasswordEncoder().encode(updates.get("password"));
            // change this to the actual setter in your User entity
            user.setPasswordHash(hashed);
        }

        return userRepository.save(user);
    }
}
