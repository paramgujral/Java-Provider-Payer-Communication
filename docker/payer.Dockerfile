# Build from the repo root:  docker build -f docker/payer.Dockerfile .
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
COPY common-fhir common-fhir
COPY payer-service payer-service
COPY provider-service/pom.xml provider-service/pom.xml
RUN mvn -q -pl payer-service -am package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/payer-service/target/payer-service-1.0.0.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
