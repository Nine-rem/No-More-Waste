import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

export default function CancelledPage() {
    const navigate = useNavigate();

    const handleRetryPayment = () => {
        navigate('/subscriptions'); // Rediriger vers la page des abonnements pour réessayer
    };

    return (
        <div className="cancelled-container">
            <h1>Paiement annulé</h1>
            <p>Votre paiement a été annulé. Vous pouvez réessayer de vous abonner en cliquant ci-dessous.</p>
            <Button variant="dark" onClick={handleRetryPayment}>Réessayer le paiement</Button>
        </div>
    );
}
