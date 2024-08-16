import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import '../style/AdminEditSubscriptionPage.css';  // Créez un fichier CSS pour les styles spécifiques

export default function AdminEditSubscriptionPage() {
    const { id } = useParams();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [priceId, setPriceId] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('month'); 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Récupérer les détails de l'abonnement pour pré-remplir le formulaire
        axios.get(`/subscription/${id}`)
            .then(response => {
                setName(response.data.name);
                setPrice(response.data.price);
                setPriceId(response.data.price_id);
                setDescription(response.data.description);
                setFrequency(response.data.frequency);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération de l\'abonnement:', error);
                setErrorMessage('Erreur lors de la récupération de l\'abonnement.');
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            name,
            price,
            price_id: priceId,
            description,
            frequency
        };

        try {
            await axios.put(`/subscription/${id}`, data);
            setSuccessMessage('Abonnement mis à jour avec succès');
            setTimeout(() => navigate('/account/admin/subscriptions'), 2000); // Redirige après 2 secondes
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
            setErrorMessage('Erreur lors de la mise à jour de l\'abonnement.');
        }
    };

    return (
        <div className="container">
            <h1>Modifier l'abonnement</h1>
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

                <Form.Group controlId="formSubscriptionPriceId">
                    <Form.Label>Identifiant du prix (Price ID)</Form.Label>
                    <Form.Control
                        type="text"
                        value={priceId}
                        readOnly  // Rendre le champ non modifiable
                        className="non-editable"  // Ajouter une classe CSS spécifique
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

                <Button variant="primary" type="submit">
                    Mettre à jour
                </Button>
            </Form>
        </div>
    );
}
