import { useEffect, useState } from "react";
import axios from "axios";

function ProviderPage() {

    const [requests, setRequests] = useState([]);

    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        providerName: "",
        patientName: "",
        insuranceId: "",
        diagnosisCode: "",
        procedureCode: "",
        clinicalNotes: ""
    });

    const loadRequests = async () => {

        const response =
            await axios.get(
                "http://localhost:8081/provider/requests"
            );

        setRequests(response.data);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const createRequest = async () => {

        await axios.post(
            "http://localhost:8081/provider/requests",
            form
        );

        loadRequests();

        setForm({
            providerName: "",
            patientName: "",
            insuranceId: "",
            diagnosisCode: "",
            procedureCode: "",
            clinicalNotes: ""
        });
    };

    const updateRequest = async () => {

        await axios.put(
            `http://localhost:8081/provider/requests/${editId}`,
            form
        );

        setEditId(null);

        loadRequests();

        setForm({
            providerName: "",
            patientName: "",
            insuranceId: "",
            diagnosisCode: "",
            procedureCode: "",
            clinicalNotes: ""
        });
    };

    const reviewRequest = async (id) => {

        await axios.post(
            `http://localhost:8081/provider/requests/${id}/review`
        );

        loadRequests();
    };

    const submitRequest = async (id) => {

        await axios.post(
            `http://localhost:8081/provider/requests/${id}/submit`
        );

        loadRequests();
    };

    return (
        <div className="container mt-4">

            <h2>Provider Dashboard</h2>

            <input
                className="form-control mb-2"
                placeholder="Provider / Hospital Name"
                value={form.providerName}
                onChange={(e) =>
                    setForm({
                        ...form,
                        providerName: e.target.value.replace(/[^A-Za-z ]/g, "")
                    })
                }
            />

            <input
                className="form-control mb-2"
                placeholder="Patient Name"
                value={form.patientName}
                onChange={(e) =>
                    setForm({
                        ...form,
                        patientName: e.target.value.replace(/[^A-Za-z ]/g, "")
                    })
                }
            />

            <div className="input-group mb-2">

                <span className="input-group-text">
                    IN
                </span>

                <input
                    className="form-control"
                    placeholder="1234"
                    maxLength="4"
                    value={form.insuranceId.replace("IN", "")}
                    onChange={(e) => {

                        const value =
                            e.target.value.replace(/\D/g, "");

                        setForm({
                            ...form,
                            insuranceId: "IN" + value
                        });
                    }}
                />

            </div>

            <div className="input-group mb-2">

                <span className="input-group-text">
                    DC
                </span>

                <input
                    className="form-control"
                    placeholder="123"
                    maxLength="3"
                    value={form.diagnosisCode.replace("DC", "")}
                    onChange={(e) => {

                        const value =
                            e.target.value.replace(/\D/g, "");

                        setForm({
                            ...form,
                            diagnosisCode: "DC" + value
                        });
                    }}
                />

            </div>

            <div className="input-group mb-2">

                <span className="input-group-text">
                    PC
                </span>

                <input
                    className="form-control"
                    placeholder="123"
                    maxLength="3"
                    value={form.procedureCode.replace("PC", "")}
                    onChange={(e) => {

                        const value =
                            e.target.value.replace(/\D/g, "");

                        setForm({
                            ...form,
                            procedureCode: "PC" + value
                        });
                    }}
                />

            </div>

            <textarea
                className="form-control mb-1"
                placeholder="Clinical Notes"
                rows="4"
                value={form.clinicalNotes}
                onChange={(e) =>
                    setForm({
                        ...form,
                        clinicalNotes: e.target.value
                    })
                }
            />

            <div
                className={`text-end mb-3 ${form.clinicalNotes.length >= 30
                        ? "text-success"
                        : "text-danger"
                    }`}
            >
                Characters:
                {" "}
                {form.clinicalNotes.length}/30
            </div>

            <button
                className="btn btn-primary mb-4"
                onClick={() => {

                    if (editId) {

                        updateRequest();

                    } else {

                        createRequest();
                    }
                }}
            >

                {editId
                    ? "Update Request"
                    : "Create Request"}

            </button>

            <table className="table table-bordered align-middle">

                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Patient</th>
                        <th>Status</th>
                        <th style={{ width: "45%" }}>
                            AI Recommendation
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    {requests.map((request) => (

                        <tr key={request.id}>

                            <td>{request.id}</td>

                            <td>{request.patientName}</td>

                            <td>
                                <strong>{request.status}</strong>
                            </td>

                            <td style={{ minWidth: "450px" }}>
                                <div
                                    className="border rounded p-2 bg-light"
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        maxHeight: "250px",
                                        overflowY: "auto",
                                        fontSize: "14px"
                                    }}
                                >
                                    {request.aiRecommendation || "No AI Review yet"}
                                </div>
                            </td>

                            <td>

                                <button
                                    className="btn btn-warning btn-sm me-2 mb-1"
                                    disabled={
                                        request.status === "SUBMITTED" ||
                                        request.status === "REJECTED" ||
                                        request.status === "APPROVED"
                                    }
                                    onClick={() =>
                                        reviewRequest(request.id)
                                    }
                                >
                                    AI Review
                                </button>

                                <button
                                    className="btn btn-info btn-sm me-2 mb-1"
                                    disabled={
                                        request.status === "SUBMITTED" ||
                                        request.status === "APPROVED"
                                    }
                                    onClick={() => {

                                        setEditId(request.id);

                                        setForm({

                                            providerName:
                                                request.providerName,

                                            patientName:
                                                request.patientName,

                                            insuranceId:
                                                request.insuranceId,

                                            diagnosisCode:
                                                request.diagnosisCode,

                                            procedureCode:
                                                request.procedureCode,

                                            clinicalNotes:
                                                request.clinicalNotes
                                        });
                                    }}
                                >
                                    Edit
                                </button>

                                <button
                                    className="btn btn-success btn-sm mb-1"
                                    disabled={
                                        request.status === "SUBMITTED" ||
                                        request.status === "REJECTED" ||
                                        request.status === "APPROVED"
                                    }
                                    onClick={() =>
                                        submitRequest(request.id)
                                    }
                                >
                                    Submit
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default ProviderPage;