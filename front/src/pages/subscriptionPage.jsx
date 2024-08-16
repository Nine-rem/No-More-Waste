import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { UserContext } from '../userContext';
import '../style/subscriptionPage.css'; 

export default function SubscriptionPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [userSubscriptions, setUserSubscriptions] = useState([]);
    const { user, ready } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!ready) {
            return; // Attendez que l'utilisateur soit chargé
        }

        if (!user) {
            navigate('/login'); // Redirigez si l'utilisateur n'est pas connecté
            return;
        }
        // Récupérer les options d'abonnement depuis le backend
        axios.get('/subscriptions')
            .then(response => {
                setSubscriptions(response.data);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des abonnements:", error);
                setErrorMessage("Erreur lors de la récupération des abonnements.");
            });

        // Récupérer les abonnements de l'utilisateur
        axios.get(`/user-subscriptions/${user.idUser}`)
            .then(response => {
                const subscriptionIds = response.data.map(sub => sub.idSubscription);
                setUserSubscriptions(subscriptionIds);
                console.log('User Subscriptions:', subscriptionIds);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des abonnements de l'utilisateur:", error);
            });
    }, [user, ready, navigate]);

    const handleSubscribe = async (idSubscription) => {
        try {
            if (userSubscriptions.includes(idSubscription)) {
                setErrorMessage("Vous êtes déjà abonné à ce service.");
                return;
            }

            const response = await axios.post('/create-subscription', { idSubscription });

            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Erreur lors de la création de la session Stripe:', error);
            setErrorMessage("Erreur lors de la création de la session Stripe.");
        }
    };

    const handleUnsubscribe = async (idSubscription) => {
        try {
            const response = await axios.post('/unsubscribe', { idSubscription });

            if (response.data.message) {
                setUserSubscriptions(userSubscriptions.filter(sub => sub !== idSubscription));
                setErrorMessage(""); // Clear any existing error messages
                alert(response.data.message); // Inform the user of successful unsubscription
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'abonnement:', error);
            setErrorMessage("Erreur lors de la suppression de l'abonnement.");
        }
    };

    return (
        <div className="subscription-container">
            <h1>Sélectionnez un abonnement</h1>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <div className="subscription-options">
                {subscriptions.map(subscription => (
                    <div key={subscription.idSubscription} className="subscription-card">
                        <h2>{subscription.description}</h2>
                        <p>{subscription.price} €/mois</p>
                        {userSubscriptions.includes(subscription.idSubscription) ? (
                            <>
                                <Button variant="secondary" onClick={() => handleUnsubscribe(subscription.idSubscription)}>
                                    Se désabonner
                                </Button>
                            </>
                        ) : (
                            <Button variant="primary" onClick={() => handleSubscribe(subscription.idSubscription)}>
                                S'abonner
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
