# Build Stage
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app
# HARD CACHE BUST - Version 1.0.7
ARG CACHE_BUST=6
LABEL build_version="1.0.7"

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
