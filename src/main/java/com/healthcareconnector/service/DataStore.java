package com.healthcareconnector.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcareconnector.model.Database;
import com.healthcareconnector.model.User;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * Minimal file-backed "database". Mirrors the Node.js prototype's
 * data/db.json approach so the project stays dependency-light (no external
 * DB required to run the demo). Swap this out for a real repository
 * (JPA/Postgres/Mongo) in production.
 */
@Service
public class DataStore {

    private final Path dbPath = Paths.get("data", "db.json");
    private final ObjectMapper mapper = new ObjectMapper();
    private Database database;

    public DataStore() {
        mapper.findAndRegisterModules();
        load();
    }

    private synchronized void load() {
        try {
            File file = dbPath.toFile();
            if (!file.exists()) {
                file.getParentFile().mkdirs();
                database = seedDatabase();
                save();
                return;
            }
            database = mapper.readValue(file, Database.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load database file: " + dbPath, e);
        }
    }

    public synchronized Database getDatabase() {
        return database;
    }

    public synchronized void save() {
        try {
            Files.createDirectories(dbPath.getParent());
            mapper.writerWithDefaultPrettyPrinter().writeValue(dbPath.toFile(), database);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save database file: " + dbPath, e);
        }
    }

    private Database seedDatabase() {
        Database db = new Database();
        List<User> users = new ArrayList<>();
        users.add(new User("provider1", "provider123", "provider", "Dr. Sarah Chen", "Riverside Clinic"));
        users.add(new User("payer1", "payer123", "payer", "Alex Morgan", "UnitedHealth Payer Ops"));
        db.setUsers(users);
        return db;
    }
}
