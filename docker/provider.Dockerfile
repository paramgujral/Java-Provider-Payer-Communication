# Build from the repo root:  docker build -f docker/provider.Dockerfile .
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
COPY common-fhir common-fhir
COPY provider-service provider-service
COPY payer-service/pom.xml payer-service/pom.xml
RUN mvn -q -pl provider-service -am package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/provider-service/target/provider-service-1.0.0.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
