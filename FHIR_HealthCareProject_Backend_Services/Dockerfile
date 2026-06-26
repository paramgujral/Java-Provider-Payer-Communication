# Stage 1: Build the Spring Boot application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package the application jar
RUN mvn clean package -DskipTests

# Stage 2: Run the application jar
FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/target/fhir-authorization-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
