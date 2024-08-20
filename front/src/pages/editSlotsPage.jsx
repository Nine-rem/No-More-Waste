import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Form, Alert, Container, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import { format } from "date-fns";

export default function EditSlotsPage() {
    const { idService } = useParams();
    const [slots, setSlots] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

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

    const handleSlotChange = (index, field, value) => {
        const updatedSlots = slots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );
        setSlots(updatedSlots);
    };

    const handleDeleteSlot = async (idTimeslot) => {
        try {
            await axios.delete(`/api/services/slots/${idTimeslot}`);
            setSlots(slots.filter(slot => slot.idTimeslot !== idTimeslot));
            setSuccessMessage("Créneau horaire supprimé avec succès !");
        } catch (error) {
            console.error("Erreur lors de la suppression du créneau horaire:", error);
            setErrorMessage("Erreur lors de la suppression du créneau horaire.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`/api/services/${idService}/slots`, { slots });
            setSuccessMessage("Créneaux horaires mis à jour avec succès !");
            setTimeout(() => navigate('/account/volunteer/myServices'), 2000);
        } catch (error) {
            console.error("Erreur lors de la mise à jour des créneaux horaires:", error);
            setErrorMessage("Erreur lors de la mise à jour des créneaux horaires.");
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Modifier les créneaux horaires</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                {slots.map((slot, index) => (
                    <Card key={slot.idTimeslot} className="mb-3">
                        <Card.Body>
                            <Row>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={format(new Date(slot.date), "yyyy-MM-dd")}
                                            onChange={(e) => handleSlotChange(index, "date", e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Heure</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={slot.time}
                                            onChange={(e) => handleSlotChange(index, "time", e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4} className="d-flex align-items-center justify-content-end">
                                    <Button variant="danger" onClick={() => handleDeleteSlot(slot.idTimeslot)}>
                                        Supprimer
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}
                <div className="text-center mt-4">
                    <Button variant="primary" type="submit">
                        Mettre à jour les créneaux horaires
                    </Button>
                </div>
            </Form>
        </Container>
    );
}
