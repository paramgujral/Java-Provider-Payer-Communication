package com.healthcareconnector.model;

public class User {
    private String username;
    private String password;
    private String role; // "provider" | "payer"
    private String name;
    private String org;

    public User() {}

    public User(String username, String password, String role, String name, String org) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.name = name;
        this.org = org;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOrg() { return org; }
    public void setOrg(String org) { this.org = org; }

    /** Returns a copy safe to expose to clients (no password). */
    public SafeUser toSafeUser() {
        return new SafeUser(username, role, name, org);
    }

    public static class SafeUser {
        private String username;
        private String role;
        private String name;
        private String org;

        public SafeUser() {}

        public SafeUser(String username, String role, String name, String org) {
            this.username = username;
            this.role = role;
            this.name = name;
            this.org = org;
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getOrg() { return org; }
        public void setOrg(String org) { this.org = org; }
    }
}
