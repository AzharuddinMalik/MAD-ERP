# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Force cache invalidation for the code build
ARG CACHE_BUST=1
LABEL build_version="1.0.2"

COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Use explicit production profile and prefer IPv4
ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
