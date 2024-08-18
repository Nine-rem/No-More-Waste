import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Col, Row, Alert } from "react-bootstrap";

export default function EditUserPage() {
    const { id } = useParams(); // Récupère l'ID de l'utilisateur à partir des paramètres d'URL
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        lastname: '',
        firstname: '',
        birthdate: '',
        address: '',
        city: '',
        postalCode: '',
        phoneNumber: '',
        email: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(""); // État pour le message de succès

    useEffect(() => {
        // Charger les données de l'utilisateur à modifier
        axios.get(`/api/users/${id}`, { withCredentials: true })
            .then(response => {
                const user = response.data;
                setUserData({
                    lastname: user.lastname,
                    firstname: user.firstname,
                    birthdate: user.birthdate,
                    address: user.address,
                    city: user.city,
                    postalCode: user.postalCode,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                });
            })
            .catch(error => {
                console.error("Erreur lors du chargement des données de l'utilisateur :", error);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFieldErrors({});
        setSuccessMessage(""); // Réinitialiser le message de succès

        axios.put(`/api/users/${id}`, userData, { withCredentials: true })
            .then(response => {
                setSuccessMessage("Utilisateur mis à jour avec succès !");
                setTimeout(() => {
                    navigate('/account/');
                }, 2000);
            })
            .catch(error => {
                if (error.response && error.response.data) {
                    setFieldErrors(error.response.data.errors || {});
                }
                console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
            });
    };

    return (
        <div id="editUser" className="container mt-5">
            <h1 className="text-center mb-4">Modifier un utilisateur</h1>
            {successMessage && <Alert variant="success">{successMessage}</Alert>} {/* Message de succès */}
            <Form onSubmit={handleSubmit}>
                {/* Champ Nom */}
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Nom
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control 
                            type="text" 
                            placeholder="Nom" 
                            name="lastname"
                            value={userData.lastname} 
                            onChange={handleChange} 
                            required 
                        />
                        {fieldErrors.lastname && <p className="text-danger">{fieldErrors.lastname}</p>}
                    </Col>
                </Form.Group>

                {/* Champ Prénom */}
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Prénom
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control 
                            type="text" 
                            placeholder="Prénom" 
                            name="firstname"
                            value={userData.firstname} 
                            onChange={handleChange} 
                            required 
                        />
                        {fieldErrors.firstname && <p className="text-danger">{fieldErrors.firstname}</p>}
                    </Col>
                </Form.Group>

                {/* Champ Date de naissance */}
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Date de naissance
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control 
                            type="date" 
                            name="birthdate"
                            value={userData.birthdate} 
                            onChange={handleChange} 
                            required 
                        />
                        {fieldErrors.birthdate && <p className="text-danger">{fieldErrors.birthdate}</p>}
                    </Col>
                </Form.Group>

                {/* Champ Adresse */}
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Adresse
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control 
                            type="text" 
                            placeholder="Adresse" 
                            name="address"
                            value={userData.address} 
                            onChange={handleChange} 
                            required 
                        />
                        {fieldErrors.address && <p className="text-danger">{fieldErrors.address}</p>}
                    </Col>
                </Form.Group>

                {/* Champ Ville */}
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">Ville</Form.Label>
                    <Col sm="10">
                        <Form.Control 
                            type="text" 
                            placeholder="Ville" 
                            name="city"
                            value={userData.city} 
                            onChange={handleChange} 
                            required 
                        />
                        {fieldErrors.city && <p className="text-danger">{fieldErrors.city}</p>}
                    </Col>
                </Form.Group>

                {/* Champ Code postal */}
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Code postal
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control 
                            type="text" 
                            placeholder="Code postal" 
                            name="postalCode"
                            value={userData.postalCode} 
                            onChange={handleChange} 
                            required 
                        />
                        {fieldErrors.postalCode && <p className="text-danger">{fieldErrors.postalCode}</p>}
                    </Col>
                </Form.Group>

                {/* Champ Téléphone */}
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Numéro de téléphone
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control 
                            type="text" 
                            placeholder="Numéro de téléphone" 
                            name="phoneNumber"
                            value={userData.phoneNumber} 
                            onChange={handleChange} 
                            required 
                        />
                        {fieldErrors.phoneNumber && <p className="text-danger">{fieldErrors.phoneNumber}</p>}
                    </Col>
                </Form.Group>

                {/* Champ Email */}
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Email
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control 
                            type="email" 
                            placeholder="votre@email.com" 
                            name="email"
                            value={userData.email} 
                            onChange={handleChange} 
                            required 
                        />
                        {fieldErrors.email && <p className="text-danger">{fieldErrors.email}</p>}
                    </Col>
                </Form.Group>
        
                {/* Bouton de soumission */}
                <Row>
                    <Col sm="12">
                        <Button variant="dark" type="submit" className="w-100">Mettre à jour</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}
