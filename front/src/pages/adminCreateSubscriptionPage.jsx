import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';

export default function AdminCreateSubscriptionPage() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('month'); // Par défaut à 'month'
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            name,
            price,
            description,
            frequency
        };

        try {
            await axios.post('/api/subscription', data);
            setSuccessMessage('Abonnement créé avec succès');
            setTimeout(() => navigate('/account/admin/subscriptions'), 2000); // Redirige après 2 secondes
        } catch (error) {
            console.error('Erreur lors de la création de l\'abonnement:', error);
            setErrorMessage('Erreur lors de la création de l\'abonnement.');
        }
    };

    return (
        <div className="container">
            <h1>Créer un nouvel abonnement</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formSubscriptionName">
                    <Form.Label>Nom de l'abonnement</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formSubscriptionPrice">
                    <Form.Label>Prix de l'abonnement (en €)</Form.Label>
                    <Form.Control
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formSubscriptionDescription">
                    <Form.Label>Description de l'abonnement</Form.Label>
                    <Form.Control
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="formSubscriptionFrequency">
                    <Form.Label>Fréquence de facturation</Form.Label>
                    <Form.Control
                        as="select"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        required
                    >
                        <option value="month">Mensuel</option>
                        <option value="year">Annuel</option>
                    </Form.Control>
                </Form.Group>

                <Button variant="dark" type="submit">
                    Créer
                </Button>
            </Form>
        </div>
    );
}
