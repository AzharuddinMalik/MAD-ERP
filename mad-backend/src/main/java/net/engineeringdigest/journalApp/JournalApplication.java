package net.engineeringdigest.journalApp;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableCaching
@EnableAsync
public class JournalApplication {

    public static void main(String[] args) {
        // 🛡️ Load .env variables into System Properties
        try {
            io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
                    .directory("../")
                    .ignoreIfMissing()
                    .load();
            
            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
        } catch (Exception e) {
            System.out.println("ℹ️ No .env file found in parent directory, skipping manual load.");
        }

        SpringApplication.run(JournalApplication.class, args);
        // ✅ C5 FIX: Removed BCrypt.encode("admin123") println — was a debug artifact leaking to logs
    }

}