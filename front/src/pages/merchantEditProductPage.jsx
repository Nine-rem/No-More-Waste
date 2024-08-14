import React, { useState, useEffect, useContext } from "react";
import { Button, Form, Alert, Col, Row, Card } from "react-bootstrap";
import axios from "axios";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import "../style/merchantEditProductPage.css";
import { UserContext } from "../userContext";

function MerchantEditProductPage() {
    const { user, ready } = useContext(UserContext);
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        name: "",
        reference: "",
        description: "",
        stock: "",
    });
    const [photos, setPhotos] = useState([]);  // Pour stocker les photos existantes
    const [newPhotos, setNewPhotos] = useState([]);
    const [previewNewPhotos, setPreviewNewPhotos] = useState([]);
    const [altDescriptions, setAltDescriptions] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");  // État pour le message de succès

    // Vérifie si l'utilisateur est prêt (chargé) et connecté
    useEffect(() => {
        if (ready && user && user.idUser) {
            axios.get(`/users/${user.idUser}/products/${productId}`)
                .then(response => {
                    setProduct(response.data);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération du produit:", error);
                    setErrorMessage("Erreur lors de la récupération du produit");
                });

            axios.get(`/products/${productId}/photos`)
                .then(response => {
                    setPhotos(response.data);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des photos:", error);
                    setErrorMessage("Erreur lors de la récupération des photos");
                });
        }
    }, [ready, user, productId]);

    // Si l'utilisateur n'est pas encore prêt (chargé), afficher un message de chargement
    if (!ready) {
        return <div>Chargement...</div>;
    }

    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!user || !user.idUser) {
        return <Navigate to="/login" />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const filePreviews = files.map(file => URL.createObjectURL(file));
        setNewPhotos([...newPhotos, ...files]);
        setPreviewNewPhotos([...previewNewPhotos, ...filePreviews]);
    };

    const handleAltDescriptionChange = (e, index) => {
        const { value } = e.target;
        setAltDescriptions({ ...altDescriptions, [index]: value });
    };

    const handleRemoveExistingPhoto = (photoId) => {
        axios.delete(`/photos/${photoId}`)
            .then(response => {
                setPhotos(photos.filter(photo => photo.idPhoto !== photoId));
            })
            .catch(error => {
                console.error("Erreur lors de la suppression de la photo:", error);
            });
    };

    const handleRemoveNewPhoto = (index) => {
        const updatedNewPhotos = [...newPhotos];
        const updatedPreviewPhotos = [...previewNewPhotos];

        URL.revokeObjectURL(previewNewPhotos[index]);

        updatedNewPhotos.splice(index, 1);
        updatedPreviewPhotos.splice(index, 1);

        setNewPhotos(updatedNewPhotos);
        setPreviewNewPhotos(updatedPreviewPhotos);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");  // Réinitialiser le message de succès

        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("reference", product.reference || "");
        formData.append("stock", product.stock || "");
        formData.append("description", product.description || "");

        newPhotos.forEach((photo, index) => {
            formData.append("images", photo);
            formData.append("altDescriptions", altDescriptions[index] || "");
        });

        try {
            const response = await axios.put(`/products/${productId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true
            });

            setSuccessMessage("Produit mis à jour avec succès !");  // Définir le message de succès
            setNewPhotos([]);
            setPreviewNewPhotos([]);
            setAltDescriptions({});
            // Recharger la page pour afficher les nouvelles photos
            setTimeout(() => {
            window.location.reload();
        }, 1000); // Recharger la page après un délai de 1 seconde

        
        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
            if (error.response) {
                setErrorMessage(error.response.data.error || "Erreur lors de la validation des données.");
            } else {
                setErrorMessage("Erreur réseau ou serveur inaccessible.");
            }
        }
    };

    return (
        <div className="product-page">
            <h1>Modifier le produit</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}  {/* Afficher le message de succès */}
            <Form onSubmit={handleSubmit}>
                <Form.Group htmlFor="formProductName">
                    <Form.Label>Nom du produit</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group htmlFor="formProductReference">
                    <Form.Label>Référence</Form.Label>
                    <Form.Control
                        type="text"
                        name="reference"
                        value={product.reference}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group htmlFor="formProductDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group htmlFor="formProductStock">
                    <Form.Label>Stock</Form.Label>
                    <Form.Control
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Photos existantes</Form.Label>
                    <Row className="image-previews">
                        {photos.map((photo, index) => (
                            <Col key={photo.idPhoto} xs={6} md={4} lg={3}>
                                <Card className="preview-container">
                                    <Card.Img variant="top" src={photo.fullPath} alt={`Photo ${index}`} className="preview-image" />
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRemoveExistingPhoto(photo.idPhoto)}
                                    >
                                        Supprimer
                                    </Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Form.Group>

                <Form.Group htmlFor="formNewPhotos">
                    <Form.Label>Ajouter de nouvelles photos</Form.Label>
                    <div onClick={() => document.getElementById("newImageUploadInput").click()} className="image-upload-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                        </svg>
                        <span>Ajouter des images</span>
                    </div>
                    <Form.Control
                        type="file"
                        name="newPhotos"
                        id="newImageUploadInput"
                        onChange={handleFileChange}
                        multiple
                        style={{ display: "none" }}
                    />
                </Form.Group>

                <Row className="image-previews">
                    {previewNewPhotos.map((src, index) => (
                        <Col key={index} xs={6} md={4} lg={3}>
                            <Card className="preview-container">
                                <Card.Img variant="top" src={src} alt={`Preview ${index}`} className="preview-image" />
                                <Card.Body>
                                    <Form.Control
                                        type="text"
                                        placeholder="Petite description"
                                        value={altDescriptions[index] || ""}
                                        onChange={(e) => handleAltDescriptionChange(e, index)}
                                    />
                                    <Button variant="danger" onClick={() => handleRemoveNewPhoto(index)}>Supprimer</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Button variant="primary" type="submit">
                    Mettre à jour
                </Button>
            </Form>
        </div>
    );
}

export default MerchantEditProductPage;
