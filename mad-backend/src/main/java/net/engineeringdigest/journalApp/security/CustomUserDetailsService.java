package net.engineeringdigest.journalApp.security;

import net.engineeringdigest.journalApp.model.User;
import net.engineeringdigest.journalApp.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Fetch User
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // 2. Extract Role Name
        String roleName = user.getRole().getName();

        // 🟢 Ensure the role is prefixed with 'ROLE_' for hasRole() compatibility
        if (roleName != null && !roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        // Safety check: Ensure role exists
        if (roleName == null) {
            throw new UsernameNotFoundException("User has no role assigned");
        }

        // 3. Return Standard Spring Security User
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }
}