package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.User;
import net.engineeringdigest.journalApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')") // 🟢 Allow supervisors to read user data
public class UserController {

    @Autowired
    private UserService userService;

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        User user = new User();
        user.setUsername(payload.get("username"));
        user.setPasswordHash(payload.get("password")); // Will be hashed in service
        user.setFullName(payload.get("fullName"));

        String roleName = payload.get("role"); // UserDTO handling simplified for Map first

        return ResponseEntity.ok(userService.createUser(user, roleName));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        User user = new User();
        if (payload.containsKey("fullName"))
            user.setFullName((String) payload.get("fullName"));
        if (payload.containsKey("isActive"))
            user.setIsActive((Boolean) payload.get("isActive"));
        if (payload.containsKey("password"))
            user.setPasswordHash((String) payload.get("password"));

        String roleName = (String) payload.get("role");

        return ResponseEntity.ok(userService.updateUser(id, user, roleName));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().body("{\"message\": \"User deactivated successfully\"}");
    }
}
