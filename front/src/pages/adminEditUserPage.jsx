import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Alert } from "react-bootstrap";

export default function AdminEditUserPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        // Récupérer les informations de l'utilisateur à partir de l'API
        axios.get(`/api/users/${id}`)
            .then(response => {
                setUser(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError("Erreur lors de la récupération des informations de l'utilisateur.");
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Mettre à jour les informations de l'utilisateur via l'API
        axios.put(`/api/users/${id}`, user)
            .then(response => {
                setSuccess("Les informations de l'utilisateur ont été mises à jour avec succès.");
            })
            .catch(error => {
                setError("Erreur lors de la mise à jour des informations de l'utilisateur.");
            });
    };

    if (loading) {
        return <p>Chargement des informations de l'utilisateur...</p>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!user) {
        return <Navigate to="/admin/users" />;
    }

    return (
        <div>
            <h1>Modifier l'utilisateur</h1>
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formFirstname">
                    <Form.Label>Prénom</Form.Label>
                    <Form.Control
                        type="text"
                        name="firstname"
                        value={user.firstname}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formLastname">
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                        type="text"
                        name="lastname"
                        value={user.lastname}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formAddress">
                    <Form.Label>Adresse</Form.Label>
                    <Form.Control
                        type="text"
                        name="address"
                        value={user.address}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formCity">
                    <Form.Label>Ville</Form.Label>
                    <Form.Control
                        type="text"
                        name="city"
                        value={user.city}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formPostalCode">
                    <Form.Label>Code Postal</Form.Label>
                    <Form.Control
                        type="text"
                        name="postalCode"
                        value={user.postalCode}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formCountry">
                    <Form.Label>Pays</Form.Label>
                    <Form.Control
                        type="text"
                        name="country"
                        value={user.country}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formPhoneNumber">
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                        type="text"
                        name="phoneNumber"
                        value={user.phoneNumber}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formBirthdate">
                    <Form.Label>Date de naissance</Form.Label>
                    <Form.Control
                        type="date"
                        name="birthdate"
                        value={user.birthdate}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formIsAdmin">
                    <Form.Check
                        type="checkbox"
                        label="Administrateur"
                        name="isAdmin"
                        checked={user.isAdmin}
                        onChange={(e) => setUser({ ...user, isAdmin: e.target.checked })}
                    />
                </Form.Group>

                <Form.Group controlId="formIsMerchant">
                    <Form.Check
                        type="checkbox"
                        label="Marchand"
                        name="isMerchant"
                        checked={user.isMerchant}
                        onChange={(e) => setUser({ ...user, isMerchant: e.target.checked })}
                    />
                </Form.Group>

                <Form.Group controlId="formIsVolunteer">
                    <Form.Check
                        type="checkbox"
                        label="Bénévole"
                        name="isVolunteer"
                        checked={user.isVolunteer}
                        onChange={(e) => setUser({ ...user, isVolunteer: e.target.checked })}
                    />
                </Form.Group>

                <Form.Group controlId="formIsBanned">
                    <Form.Check
                        type="checkbox"
                        label="Banni"
                        name="isBanned"
                        checked={user.isBanned}
                        onChange={(e) => setUser({ ...user, isBanned: e.target.checked })}
                    />
                </Form.Group>

                <Button variant="dark" type="submit" className="mt-3">
                    Mettre à jour
                </Button>
            </Form>
        </div>
    );
}
