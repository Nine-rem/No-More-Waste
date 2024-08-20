import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';

function AllServicesPage() {
    const [services, setServices] = useState([]);

    useEffect(() => {
        axios.get('/api/services')
            .then(response => {
                setServices(response.data);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des services:", error);
            });
    }, []);

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1>Tous les Services</h1>
                </Col>
            </Row>
            <Row>
                {services.map(service => (
                    <Col key={service.idService} sm={12} md={6} lg={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{service.name}</Card.Title>
                                <Card.Text>
                                    {service.description}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default AllServicesPage;
