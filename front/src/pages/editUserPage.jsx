import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Col, Row } from "react-bootstrap";

export default function EditUserPage() {
    const { id } = useParams(); // Récupère l'ID de l'utilisateur à partir des paramètres d'URL
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        lastName: '',
        firstName: '',
        birthdate: '',
        address: '',
        city: '',
        postalCode: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        // Charger les données de l'utilisateur à modifier
        axios.get(`/api/users/${id}`, { withCredentials: true })
        
            .then(response => {
                const user = response.data;
                console.log(user);
                setUserData({
                    lastname: user.lastname,
                    firstname: user.firstname,
                    birthdate: user.birthdate,
                    address: user.address,
                    city: user.city,
                    postalCode: user.postalCode,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                    password: '',
                    confirmPassword: ''
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
        // Valider les données avant de les envoyer
        if (userData.password !== userData.confirmPassword) {
            setFieldErrors({ confirmPassword: "Les mots de passe ne correspondent pas" });
            return;
        }

        axios.put(`/api/users/${id}`, userData, { withCredentials: true })
            .then(() => {
                // Redirection après mise à jour réussie
                navigate('/account/admin/users');
            })
            .catch(error => {
                console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
                if (error.response && error.response.data) {
                    setFieldErrors(error.response.data.errors || {});
                }
            });
    };

    return (
        <div id="editUser" className="container">
            <h1 className="text-4xl text-center">Modifier un utilisateur</h1>
            <Form onSubmit={handleSubmit}>
                {/* Champ Nom */}
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextLastName">
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
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextFirstName">
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
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextBirthdate">
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
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextAddress">
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
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextCity">
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
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextPostalCode">
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
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextPhone">
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
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
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
