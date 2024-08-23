import React, { useState, useEffect } from "react";
import { Container, ListGroup, Alert, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminListServicePage() {
    const [services, setServices] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('/api/services');
            setServices(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des services:", error);
            setErrorMessage("Erreur lors de la récupération des services.");
        }
    };

    const handleDelete = async (idService) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
            try {
                await axios.delete(`/api/services/${idService}`);
                setServices(services.filter(service => service.idService !== idService));
            } catch (error) {
                console.error("Erreur lors de la suppression du service:", error);
                setErrorMessage("Erreur lors de la suppression du service.");
            }
        }
    };
    
    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Liste des Services</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <div className="mb-4 text-center">
                <Link to="/account/admin/services/add">
                    <Button variant="dark">Ajouter un Service</Button>
                </Link>
            </div>
            <ListGroup>
                {services.length > 0 ? (
                    services.map(service => (
                        <ListGroup.Item key={service.idService} className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{service.name}</strong> - {service.description}
                            </div>
                            <div>
                                <Link to={`/account/admin/services/${service.idService}/edit`}>
                                    <Button variant="warning" className="me-2">Modifier</Button>
                                </Link>
                                <Button variant="danger" onClick={() => handleDelete(service.idService)}>
                                    Supprimer
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))
                ) : (
                    <Alert variant="info">Aucun service trouvé</Alert>
                )}
            </ListGroup>
        </Container>
    );
}

export default AdminListServicePage;
