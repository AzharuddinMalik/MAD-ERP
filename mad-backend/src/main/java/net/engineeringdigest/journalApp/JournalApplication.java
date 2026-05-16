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

        System.out.println("***************************************************");
        System.out.println("🚀🚀🚀 MAD-ERP STARTING - VERSION 1.0.5 🚀🚀🚀");
        System.out.println("***************************************************");
        System.out.println("🚀 main() started - Profile selection phase.");
        
        // Diagnostic: List all environment keys (Safely)
        System.out.println("🔍 Available Environment Keys: " + String.join(", ", System.getenv().keySet()));

        // Check for multiple possible Render/Spring keys
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl == null) dbUrl = System.getenv("DB_URL");
        if (dbUrl == null) dbUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (dbUrl == null) dbUrl = System.getenv("DATABASE_PUBLIC_URL");

        System.out.println("ℹ️ Connection string found: " + (dbUrl != null ? "YES" : "NO"));
        if (dbUrl != null && dbUrl.startsWith("postgres://")) {
            try {
                // Parse the postgres:// URI
                java.net.URI dbUri = new java.net.URI(dbUrl);
                String username = dbUri.getUserInfo().split(":")[0];
                String password = dbUri.getUserInfo().split(":")[1];
                String dbHost = dbUri.getHost();
                int dbPort = dbUri.getPort();
                String dbName = dbUri.getPath();

                // Construct JDBC URL: jdbc:postgresql://host:port/dbname?sslmode=require
                String jdbcUrl = "jdbc:postgresql://" + dbHost + ":" + dbPort + dbName;
                if (!jdbcUrl.contains("?")) {
                    jdbcUrl += "?sslmode=require";
                } else if (!jdbcUrl.contains("sslmode")) {
                    jdbcUrl += "&sslmode=require";
                }

                // Explicitly set Spring properties to override any other config
                System.setProperty("spring.datasource.url", jdbcUrl);
                System.setProperty("spring.datasource.username", username);
                System.setProperty("spring.datasource.password", password);
                System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");

                System.out.println("✅ Successfully parsed Render DATABASE_URL and configured DataSource.");
            } catch (Exception e) {
                System.err.println("❌ Failed to parse DATABASE_URL: " + e.getMessage());
                // Fallback to simple replacement if parsing fails
                String jdbcUrl = dbUrl.replace("postgres://", "jdbc:postgresql://");
                System.setProperty("spring.datasource.url", jdbcUrl);
            }
        }

        SpringApplication.run(JournalApplication.class, args);
    }
    // ✅ C5 FIX: Removed BCrypt.encode("admin123") println — was a debug artifact leaking to logs

}