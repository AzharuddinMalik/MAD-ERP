package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.User;
import net.engineeringdigest.journalApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        try {
            User user = new User();
            user.setUsername(payload.get("username"));
            user.setPasswordHash(payload.get("password")); // Will be hashed in service
            user.setFullName(payload.get("fullName"));

            String roleName = payload.get("role"); // UserDTO handling simplified for Map first

            return ResponseEntity.ok(userService.createUser(user, roleName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            User user = new User();
            if (payload.containsKey("fullName"))
                user.setFullName((String) payload.get("fullName"));
            if (payload.containsKey("isActive"))
                user.setIsActive((Boolean) payload.get("isActive"));

            String roleName = (String) payload.get("role");

            return ResponseEntity.ok(userService.updateUser(id, user, roleName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().body("{\"message\": \"User deactivated successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
