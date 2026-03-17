package net.engineeringdigest.journalApp.controller.api;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/hello")
    public String hello() {
        // We ask Spring Security: "Who is currently logged in?"
        // This only works if your JwtAuthenticationFilter successfully parsed the token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = authentication.getName();

        return "Authenticated! Hello " + currentUser + ". Your JWT is working.";
    }
}