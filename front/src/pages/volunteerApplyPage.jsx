import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../userContext';
import { Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function VolunteerApplyPage() {
    const { user } = useContext(UserContext);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/services')
            .then(response => {
                setServices(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des services:', error);
                setErrorMessage('Erreur lors de la récupération des services.');
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedService) {
            setErrorMessage('Veuillez sélectionner un service.');
            return;
        }

        axios.post('/api/volunteer/apply', { idUser: user.idUser, idService: selectedService })
            .then(response => {
                setSuccessMessage('Candidature soumise avec succès !');
                setSelectedService('');
                setTimeout(() => {
                    navigate('/account/services');
                }, 2000);
            })
            .catch(error => {
                console.error('Erreur lors de la soumission de la candidature:', error);
                setErrorMessage('Erreur lors de la soumission de la candidature.');
            });
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Postuler pour un service</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="serviceSelect">
                    <Form.Label>Sélectionnez un service</Form.Label>
                    <Form.Control 
                        as="select" 
                        value={selectedService} 
                        onChange={(e) => setSelectedService(e.target.value)}
                    >
                        <option value="">Choisir...</option>
                        {services.map(service => (
                            <option key={service.idService} value={service.idService}>
                                {service.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Button type="submit" variant="dark" className="mt-3">Soumettre</Button>
            </Form>
        </div>
    );
}
