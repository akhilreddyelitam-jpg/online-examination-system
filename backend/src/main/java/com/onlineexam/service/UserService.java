package com.onlineexam.service;

import com.onlineexam.dto.UserDto;
import com.onlineexam.entity.ERole;
import com.onlineexam.entity.Role;
import com.onlineexam.entity.User;
import com.onlineexam.exception.BadRequestException;
import com.onlineexam.exception.ResourceNotFoundException;
import com.onlineexam.repository.RoleRepository;
import com.onlineexam.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return new UserDto(user);
    }

    public List<UserDto> getStudents() {
        return userRepository.findByRoleName(ERole.ROLE_STUDENT).stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public List<UserDto> getTeachers() {
        return userRepository.findByRoleName(ERole.ROLE_TEACHER).stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (dto.getName() != null) {
            user.setName(dto.getName());
        }
        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new BadRequestException("Email is already in use by another account");
            }
            user.setEmail(dto.getEmail());
        }
        if (dto.getRole() != null) {
            try {
                ERole roleEnum = ERole.valueOf(dto.getRole());
                Role role = roleRepository.findByName(roleEnum)
                        .orElseGet(() -> roleRepository.save(new Role(roleEnum)));
                user.setRole(role);
            } catch (IllegalArgumentException ignored) {}
        }
        user.setActive(dto.isActive());

        User updated = userRepository.save(user);
        return new UserDto(updated);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
