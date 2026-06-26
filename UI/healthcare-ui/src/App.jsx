import { useState } from "react";
import ProviderPage from "./ProviderPage";
import PayerPage from "./PayerPage";
import NotificationPage from "./NotificationPage";

function App() {

    const [page, setPage] =
        useState("provider");

    return (

        <div className="container">

            <div className="mt-3 mb-3">

                <button
                    className="btn btn-primary me-2"
                    onClick={() =>
                        setPage("provider")
                    }
                >
                    Provider
                </button>

                <button
                    className="btn btn-secondary me-2"
                    onClick={() =>
                        setPage("payer")
                    }
                >
                    Payer
                </button>

                <button
                    className="btn btn-info"
                    onClick={() =>
                        setPage("notification")
                    }
                >
                    Notifications
                </button>

            </div>

            {page === "provider" &&
                <ProviderPage />}

            {page === "payer" &&
                <PayerPage />}

            {page === "notification" &&
                <NotificationPage />}

        </div>
    );
}

export default App;