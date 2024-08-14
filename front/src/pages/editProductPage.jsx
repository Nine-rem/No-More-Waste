import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';

function EditProductPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState({
        name: "",
        reference: "",
        description: "",
        stock: "",
        photos: []  // Pour stocker les photos existantes
    });
    const [newPhotos, setNewPhotos] = useState([]);
    const [previewPhotos, setPreviewPhotos] = useState([]);

    useEffect(() => {
        axios.get(`/products/${productId}`)
            .then(response => {
                setProduct(response.data);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération du produit:", error);
            });
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const filePreviews = files.map(file => URL.createObjectURL(file));
        setNewPhotos([...newPhotos, ...files]);
        setPreviewPhotos([...previewPhotos, ...filePreviews]);
    };

    const handleRemoveExistingPhoto = (photoId) => {
        axios.delete(`/photos/${photoId}`)
            .then(response => {
                setProduct({
                    ...product,
                    photos: product.photos.filter(photo => photo.idPhoto !== photoId)
                });
            })
            .catch(error => {
                console.error("Erreur lors de la suppression de la photo:", error);
            });
    };

    const handleRemoveNewPhoto = (index) => {
        const updatedNewPhotos = [...newPhotos];
        const updatedPreviewPhotos = [...previewPhotos];

        URL.revokeObjectURL(previewPhotos[index]);

        updatedNewPhotos.splice(index, 1);
        updatedPreviewPhotos.splice(index, 1);

        setNewPhotos(updatedNewPhotos);
        setPreviewPhotos(updatedPreviewPhotos);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("reference", product.reference || "");
        formData.append("stock", product.stock || "");
        formData.append("description", product.description || "");

        newPhotos.forEach(photo => {
            formData.append("images", photo);
        });

        axios.put(`/products/${productId}`, formData)
            .then(response => {
                alert("Produit mis à jour avec succès !");
                // Rafraîchir la page ou rediriger après la mise à jour
            })
            .catch(error => {
                console.error("Erreur lors de la mise à jour du produit:", error);
            });
    };

    return (
        <Container>
            <h1>Modifier le Produit</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formProductName">
                    <Form.Label>Nom du Produit</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formProductReference">
                    <Form.Label>Référence</Form.Label>
                    <Form.Control
                        type="text"
                        name="reference"
                        value={product.reference}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductStock">
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
                    <Row>
                        {product.photos.map((photo) => (
                            <Col key={photo.idPhoto} sm={12} md={4} lg={3} className="mb-3">
                                <Card>
                                    <Card.Img variant="top" src={photo.fullPath} />
                                    <Card.Body>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleRemoveExistingPhoto(photo.idPhoto)}
                                        >
                                            Supprimer
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Form.Group>

                <Form.Group controlId="formNewPhotos">
                    <Form.Label>Ajouter de nouvelles photos</Form.Label>
                    <Form.Control
                        type="file"
                        name="newPhotos"
                        multiple
                        onChange={handleFileChange}
                    />
                    <Row>
                        {previewPhotos.map((src, index) => (
                            <Col key={index} sm={12} md={4} lg={3} className="mb-3">
                                <Card>
                                    <Card.Img variant="top" src={src} />
                                    <Card.Body>
                                        <Button variant="danger" onClick={() => handleRemoveNewPhoto(index)}>
                                            Supprimer
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Form.Group>

                <Button variant="primary" type="submit">
                    Mettre à Jour
                </Button>
            </Form>
        </Container>
    );
}

export default EditProductPage;
