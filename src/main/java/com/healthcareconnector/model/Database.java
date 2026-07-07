package com.healthcareconnector.model;

import java.util.ArrayList;
import java.util.List;

/** In-memory / on-disk representation of the whole "database" JSON file. */
public class Database {
    private List<User> users = new ArrayList<>();
    private List<AuthorizationRequest> requests = new ArrayList<>();
    private List<Notification> notifications = new ArrayList<>();

    public List<User> getUsers() { return users; }
    public void setUsers(List<User> users) { this.users = users; }

    public List<AuthorizationRequest> getRequests() { return requests; }
    public void setRequests(List<AuthorizationRequest> requests) { this.requests = requests; }

    public List<Notification> getNotifications() { return notifications; }
    public void setNotifications(List<Notification> notifications) { this.notifications = notifications; }
}
