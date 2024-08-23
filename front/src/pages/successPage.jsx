import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

export default function SuccessPage() {
    const navigate = useNavigate();

    const handleGoToAccount = () => {
        navigate('/account');
    };

    return (
        <div className="success-container">
            <h1>Paiement réussi !</h1>
            <p>Merci pour votre abonnement. Votre paiement a été traité avec succès.</p>
            <Button variant="dark" onClick={handleGoToAccount}>Retourner à votre compte</Button>
        </div>
    );
}
