import { useEffect, useState } from "react";
import axios from "axios";

function NotificationPage() {

    const [notifications, setNotifications] =
        useState([]);

    const loadNotifications = async () => {

        const response =
            await axios.get(
                "http://localhost:8081/provider/notifications"
            );

        setNotifications(response.data);
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    return (
        <div className="container mt-4">

            <h2>Notifications</h2>

            <table className="table table-bordered">

                <thead>
                <tr>
                    <th>ID</th>
                    <th>Request ID</th>
                    <th>Message</th>
                    <th>Created At</th>
                </tr>
                </thead>

                <tbody>

                {notifications.map((notification) => (

                    <tr key={notification.id}>

                        <td>{notification.id}</td>

                        <td>
                            {notification.requestId}
                        </td>

                        <td>
                            {notification.message}
                        </td>

                        <td>
                            {notification.createdAt}
                        </td>

                    </tr>

                ))}

                </tbody>

            </table>

        </div>
    );
}

export default NotificationPage;