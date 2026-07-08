public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndIsReadFalse(Long recipientId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :userId")
    void markAllAsReadForUser(@Param("userId") Long userId);

    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(String role);

    @Query("SELECT n FROM Notification n WHERE n.type = :type AND n.recipient.id = :userId")
    List<Notification> findByTypeForUser(@Param("type") NotificationType type,
                                         @Param("userId") Long userId);
}
