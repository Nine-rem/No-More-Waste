import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminEditUserPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        firstname: "",
        lastname: "",
        birthdate: "",
        address: "",
        city: "",
        postalCode: "",
        phoneNumber: "",
        email: "",
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Fetch user data
        axios.get(`/api/users/${id}`)
            .then(response => setUser(response.data))
            .catch(error => console.error("Erreur lors de la récupération des données utilisateur :", error));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        axios.put(`/api/users/${id}`, user)
            .then(response => {
                setMessage(response.data.message);
                setTimeout(() => {
                    navigate('/account/admin/users');
                }, 2000);
            })
            .catch(error => {
                if (error.response && error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
                }
            });
    };

    return (
        <div className="container">
            <h1>Modifier l'utilisateur</h1>
            <form onSubmit={handleSubmit} className="mx-auto max-w-md">
                {message && <div className="alert alert-success">{message}</div>}
                <div className="form-group">
                    <label>Prénom</label>
                    <input
                        type="text"
                        name="firstname"
                        value={user.firstname}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.firstname && <div className="text-danger">{errors.firstname}</div>}
                </div>
                <div className="form-group">
                    <label>Nom</label>
                    <input
                        type="text"
                        name="lastname"
                        value={user.lastname}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.lastname && <div className="text-danger">{errors.lastname}</div>}
                </div>
                <div className="form-group">
                    <label>Date de naissance</label>
                    <input
                        type="date"
                        name="birthdate"
                        value={user.birthdate}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.birthdate && <div className="text-danger">{errors.birthdate}</div>}
                </div>
                <div className="form-group">
                    <label>Adresse</label>
                    <input
                        type="text"
                        name="address"
                        value={user.address}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.address && <div className="text-danger">{errors.address}</div>}
                </div>
                <div className="form-group">
                    <label>Ville</label>
                    <input
                        type="text"
                        name="city"
                        value={user.city}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.city && <div className="text-danger">{errors.city}</div>}
                </div>
                <div className="form-group">
                    <label>Code postal</label>
                    <input
                        type="text"
                        name="postalCode"
                        value={user.postalCode}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.postalCode && <div className="text-danger">{errors.postalCode}</div>}
                </div>
                <div className="form-group">
                    <label>Numéro de téléphone</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={user.phoneNumber}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.phoneNumber && <div className="text-danger">{errors.phoneNumber}</div>}
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.email && <div className="text-danger">{errors.email}</div>}
                </div>
                <button type="submit" className="btn btn-primary mt-3">Enregistrer</button>
            </form>
        </div>
    );
}
