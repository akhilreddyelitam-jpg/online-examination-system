package com.onlineexam.service;

import com.onlineexam.dto.AuthResponse;
import com.onlineexam.dto.LoginRequest;
import com.onlineexam.dto.RegisterRequest;
import com.onlineexam.dto.UserDto;
import com.onlineexam.entity.ERole;
import com.onlineexam.entity.Role;
import com.onlineexam.entity.User;
import com.onlineexam.exception.BadRequestException;
import com.onlineexam.exception.ResourceNotFoundException;
import com.onlineexam.repository.RoleRepository;
import com.onlineexam.repository.UserRepository;
import com.onlineexam.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginRequest.getEmail()));

        if (!user.isActive()) {
            throw new BadRequestException("User account is inactive. Please contact administrator.");
        }

        return new AuthResponse(jwt, new UserDto(user));
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already registered!");
        }

        ERole roleEnum = ERole.ROLE_STUDENT;
        if (registerRequest.getRole() != null) {
            String roleUpper = registerRequest.getRole().toUpperCase();
            if (roleUpper.contains("TEACHER")) {
                roleEnum = ERole.ROLE_TEACHER;
            } else if (roleUpper.contains("ADMIN")) {
                roleEnum = ERole.ROLE_ADMIN;
            }
        }

        final ERole finalRole = roleEnum;
        Role role = roleRepository.findByName(finalRole)
                .orElseGet(() -> roleRepository.save(new Role(finalRole)));

        User user = new User(
                registerRequest.getName(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                role
        );

        User savedUser = userRepository.save(user);

        // Auto authenticate after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getEmail(), registerRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return new AuthResponse(jwt, new UserDto(savedUser));
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("No authenticated user found");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found with email: " + email));
    }
}
