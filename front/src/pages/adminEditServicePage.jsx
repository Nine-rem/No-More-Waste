import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Container, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { set } from "date-fns";

function AdminEditServicePage() {
    const { idService } = useParams();
    const [service, setService] = useState({ name: "", description: "" });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchService();
    }, [idService]);

    const fetchService = async () => {
        try {
            const response = await axios.get(`/api/services/${idService}`);
            setService(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération du service:", error);
            setErrorMessage("Erreur lors de la récupération du service.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setService({ ...service, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/services/${idService}`, service);
            setSuccessMessage("Service mis à jour avec succès !");
            setTimeout(() => {
                navigate("/account/admin/services/list");
            }
            , 2000);

        } catch (error) {
            console.error("Erreur lors de la mise à jour du service:", error);
            setErrorMessage("Erreur lors de la mise à jour du service.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
            try {
                await axios.delete(`/api/services/${idService}`);
                navigate("/");
            } catch (error) {
                console.error("Erreur lors de la suppression du service:", error);
                setErrorMessage("Erreur lors de la suppression du service.");
            }
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Gérer le Service</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formServiceName">
                    <Form.Label>Nom du service</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={service.name}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formServiceDescription" className="mt-3">
                    <Form.Label>Description du service</Form.Label>
                    <Form.Control
                        type="text"
                        name="description"
                        value={service.description}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Button variant="dark" type="submit" className="mt-4">
                    Mettre à jour
                </Button>
                <Button
                    variant="danger"
                    onClick={handleDelete}
                    className="mt-4 ms-3"
                >
                    Supprimer
                </Button>
            </Form>
        </Container>
    );
}

export default AdminEditServicePage;
