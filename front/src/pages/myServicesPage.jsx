import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Row, Alert, Container } from "react-bootstrap";
import axios from "axios";
import { UserContext } from "../userContext.jsx";
import { Link } from "react-router-dom";

export default function MyServicesPage() {
    const { user, ready } = useContext(UserContext);
    const [services, setServices] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (ready && user && user.isVolunteer) {
            axios.get(`/api/volunteer/${user.idUser}/services`)
                .then(response => {
                    setServices(response.data);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des services:", error);
                    setErrorMessage("Erreur lors de la récupération des services.");
                });
        }
    }, [ready, user]);

    if (!ready) {
        return <div>Chargement...</div>;
    }

    if (!user || !user.isVolunteer) {
        return <div>Accès refusé. Vous devez être un bénévole pour accéder à cette page.</div>;
    }

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Mes Services</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Row>
                {services.length > 0 ? (
                    services.map(service => (
                        <Col key={service.idService} md={6} lg={4} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{service.name}</Card.Title>
                                    <Card.Text>
                                        {service.description}
                                    </Card.Text>
                                    <div className="d-grid gap-2">
                                        <Link to={`/account/volunteer/services/${service.idService}/slots/add`}>
                                            <Button variant="dark">Ajouter des créneaux horaires</Button>
                                        </Link>
                                        <Link to={`/account/volunteer/services/${service.idService}/slots/edit`}>
                                            <Button variant="warning">Modifier mes créneaux</Button>
                                        </Link>
                                        <Link to={`/account/volunteer/services/${service.idService}/slots/view`}>
                                            <Button variant="secondary">Afficher mes créneaux</Button>
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <Alert variant="info">Vous n'avez proposé aucun service pour le moment.</Alert>
                        <Link to="/account/volunteer/services">
                            <Button variant="dark">Proposer un service</Button>
                        </Link>
                    </Col>
                )}
            </Row>
        </Container>
    );
}
