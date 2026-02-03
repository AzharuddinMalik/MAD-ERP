package net.engineeringdigest.journalApp.service;

import net.engineeringdigest.journalApp.model.Role;
import net.engineeringdigest.journalApp.model.User;
import net.engineeringdigest.journalApp.repository.RoleRepository;
import net.engineeringdigest.journalApp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    public void testCreateUser_Success() {
        // Arrange
        User user = new User();
        user.setUsername("testuser");
        user.setPasswordHash("rawPassword");

        Role role = new Role();
        role.setName("ROLE_ADMIN");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(roleRepository.findByName("ROLE_ADMIN")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("rawPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User createdUser = userService.createUser(user, "ROLE_ADMIN");

        // Assert
        assertNotNull(createdUser);
        assertEquals("encodedPassword", createdUser.getPasswordHash());
        assertEquals("ROLE_ADMIN", createdUser.getRole().getName());
        assertTrue(createdUser.getIsActive());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    public void testCreateUser_DuplicateUsername() {
        // Arrange
        User user = new User();
        user.setUsername("existingUser");

        when(userRepository.findByUsername("existingUser")).thenReturn(Optional.of(new User()));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            userService.createUser(user, "ROLE_USER");
        });

        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
