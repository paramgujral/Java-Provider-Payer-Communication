import { useEffect, useState } from "react";
import axios from "axios";

function PayerPage() {

    const [requests, setRequests] = useState([]);

    const [showRejectModal, setShowRejectModal] = useState(false);

    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const [rejectComments, setRejectComments] = useState("");

    const loadRequests = async () => {

        const response =
            await axios.get(
                "http://localhost:8083/payer/requests"
            );

        setRequests(response.data);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const approveRequest = async (id) => {

        await axios.put(
            `http://localhost:8083/payer/requests/${id}/approve`
        );

        loadRequests();
    };

    const rejectRequest = (id) => {

        setSelectedRequestId(id);

        setRejectComments("");

        setShowRejectModal(true);
    };

    const confirmReject = async () => {

        if (!rejectComments.trim()) {

            alert("Please enter rejection comments.");

            return;
        }

        await axios.put(
            `http://localhost:8083/payer/requests/${selectedRequestId}/reject`,
            {
                comments: rejectComments
            }
        );

        setShowRejectModal(false);

        setRejectComments("");

        setSelectedRequestId(null);

        loadRequests();
    };

    return (
        <div className="container mt-4">

            <h2>Payer Dashboard</h2>

            <table className="table table-bordered">

                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Provider / Hospital</th>
                        <th>Patient</th>
                        <th>Insurance ID</th>
                        <th>Diagnosis</th>
                        <th>Procedure</th>
                        <th style={{ width: "25%" }}>Clinical Notes</th>
                        <th>Status</th>
                        <th>Comments</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    {requests.map((request) => (

                        <tr key={request.id}>

                            <td>{request.id}</td>

                            <td>
                                {request.providerName}
                            </td>

                            <td>
                                {request.patientName}
                            </td>

                            <td>
                                {request.insuranceId}
                            </td>

                            <td>
                                {request.diagnosisCode}
                            </td>

                            <td>
                                {request.procedureCode}
                            </td>

                            <td style={{ minWidth: "300px" }}>
                                <div
                                    className="border rounded p-2 bg-light"
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        maxHeight: "150px",
                                        overflowY: "auto",
                                        fontSize: "14px"
                                    }}
                                >
                                    {request.clinicalNotes}
                                </div>
                            </td>

                            <td>
                                <strong>{request.status}</strong>
                            </td>

                            <td>
                                {request.comments || "-"}
                            </td>

                            <td>

                                <button
                                    className="btn btn-success btn-sm me-2 mb-1"
                                    disabled={
                                        request.status === "APPROVED" ||
                                        request.status === "REJECTED"
                                    }
                                    onClick={() =>
                                        approveRequest(request.id)
                                    }
                                >
                                    Approve
                                </button>

                                <button
                                    className="btn btn-danger btn-sm mb-1"
                                    disabled={
                                        request.status === "APPROVED" ||
                                        request.status === "REJECTED"
                                    }
                                    onClick={() =>
                                        rejectRequest(request.id)
                                    }
                                >
                                    Reject
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            {showRejectModal && (

                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0,0,0,0.5)"
                    }}
                >

                    <div className="modal-dialog">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">

                                    Reject Authorization Request

                                </h5>

                            </div>

                            <div className="modal-body">

                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter rejection comments..."
                                    value={rejectComments}
                                    onChange={(e) =>
                                        setRejectComments(e.target.value)
                                    }
                                />

                            </div>

                            <div className="modal-footer">

                                <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setShowRejectModal(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn btn-danger"
                                    onClick={confirmReject}
                                >
                                    Reject
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default PayerPage;