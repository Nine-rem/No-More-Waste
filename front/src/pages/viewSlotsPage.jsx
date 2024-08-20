import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import axios from "axios";
import { format } from "date-fns";

export default function ViewSlotsPage() {
    const { idService } = useParams();
    const [slots, setSlots] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const response = await axios.get(`/api/services/${idService}/slots`);
                setSlots(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des créneaux horaires:", error);
                setErrorMessage("Erreur lors de la récupération des créneaux horaires.");
            }
        };
        fetchSlots();
    }, [idService]);

    if (slots.length === 0 && !errorMessage) {
        return <div>Chargement...</div>;
    }

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Mes Créneaux Horaires</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Row>
                {slots.length > 0 ? (
                    slots.map(slot => (
                        <Col key={slot.idTimeslot} md={6} lg={4} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{format(new Date(slot.date), "EEEE, d MMM yyyy")}</Card.Title>
                                    <Card.Text>
                                        Heure: {slot.time}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <Alert variant="info">Aucun créneau horaire disponible pour ce service.</Alert>
                    </Col>
                )}
            </Row>
            <div className="text-center mt-4">
                <Link to="/account/volunteer/myServices">
                    <Button variant="secondary">Retour à mes services</Button>
                </Link>
            </div>
        </Container>
    );
}
