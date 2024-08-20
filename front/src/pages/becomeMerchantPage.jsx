import React, { useContext, useState, useEffect } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { useNavigate, Navigate } from "react-router-dom";
import { UserContext } from '../userContext.jsx';
import axios from "axios";

export default function BecomeVolunteerPage() {
    const { user, ready } = useContext(UserContext);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();


    if (!user) {
        return <Navigate to="/login" />;
    }


    const handleSubmit = async (e) => {
        e.preventDefault();


        try {
            await axios.patch(`/api/merchant/apply`, {
            }, {
                withCredentials: true
            });
            setSuccessMessage("Votre demande pour devenir bénévole a été envoyée avec succès !");
            setTimeout(() => {
                navigate("/");

            }, 2000);
        } catch (error) {
            console.error("Erreur lors de l'envoi de la demande de bénévole:", error);
            setErrorMessage("Erreur lors de l'envoi de votre demande. Veuillez réessayer.");
        }
    };

    return (
        <div className="container mt-5">
            <h1>Devenir un commerçant</h1>
            <p>Vous êtes commerçant ?</p>
            <p>Chez No More Waste, nous proposons différents produits qui nous permettent d'aider les personnes dans le besoin.</p>
            
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Button variant="dark" type="submit">Devenir un commerçant</Button>
            </Form>
        </div>
    );
}
