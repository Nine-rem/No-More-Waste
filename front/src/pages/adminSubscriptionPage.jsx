import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Alert } from 'react-bootstrap';

export default function AdminSubscriptionPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Récupérer les abonnements depuis le backend
        axios.get('/api/subscriptions')
            .then(response => {
                setSubscriptions(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des abonnements:', error);
                setErrorMessage('Erreur lors de la récupération des abonnements.');
            });
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
            try {
                await axios.delete(`/api/subscription/${id}`);
                setSuccessMessage('Abonnement supprimé avec succès');
                setSubscriptions(subscriptions.filter(sub => sub.idSubscription !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'abonnement:', error);
                setErrorMessage('Erreur lors de la suppression de l\'abonnement.');
            }
        }
    };

    return (
        <div className="container">
            <h1>Gérer les abonnements</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Prix (€)</th>
                        <th>Intervalle</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subscriptions.map(sub => (
                        <tr key={sub.idSubscription}>
                            <td>{sub.idSubscription}</td>
                            <td>{sub.name}</td>
                            <td>{sub.price}</td>
                            <td>{sub.frequency}</td>
                            <td>
                                <Link to={`/account/admin/subscriptions/${sub.idSubscription}/edit`}>
                                    <Button variant="warning" className="me-2">Modifier</Button>
                                </Link>
                                <Button variant="danger" onClick={() => handleDelete(sub.idSubscription)}>Supprimer</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Link to="/account/admin/subscription/create">
                <Button variant="primary">Ajouter un nouvel abonnement</Button>
            </Link>
        </div>
    );
}
