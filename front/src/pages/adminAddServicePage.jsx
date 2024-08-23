import React, { useState } from "react";
import { Button, Form, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminAddServicePage() {
    const [serviceName, setServiceName] = useState("");
    const [description, setDescription] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!serviceName || !description) {
            setErrorMessage("Veuillez remplir tous les champs.");
            return;
        }

        try {
            const response = await axios.post('/api/services', {
                name: serviceName,
                description,
            });

            if (response.status === 200) {
                setSuccessMessage("Service ajouté avec succès !");
                setTimeout(() => {
                    navigate("/account/admin/services/list");
                }
                , 2000);

            
            } else {
                setErrorMessage("Erreur lors de l'ajout du service.");
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du service:", error);
            setErrorMessage("Erreur lors de l'ajout du service.");
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Ajouter un Service</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formServiceName">
                    <Form.Label>Nom du Service</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Entrez le nom du service"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formDescription" className="mt-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Entrez une description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Ajouter le Service
                </Button>
            </Form>
        </Container>
    );
}

export default AdminAddServicePage;
