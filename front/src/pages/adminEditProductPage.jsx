import React, { useState, useContext, useEffect } from "react";
import { Button, Form, Alert, Col, Row, Card } from "react-bootstrap";
import axios from "axios";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import "../style/merchantEditProductPage.css";
import JsBarcode from "jsbarcode";

function AdminEditProductPage() {
    const { idProduct } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        name: "",
        reference: "",
        description: "",
        stock: "",
        category: "non-alimentaire",
        brand: "",
        expiryDate: "",
    });
    const [photos, setPhotos] = useState([]);
    const [photosToRemove, setPhotosToRemove] = useState([]); // Track photos to be removed
    const [newPhotos, setNewPhotos] = useState([]);
    const [previewNewPhotos, setPreviewNewPhotos] = useState([]);
    const [altDescriptions, setAltDescriptions] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [referenceError, setReferenceError] = useState("");

    useEffect(() => {
        axios.get(`/api/admin/products/${idProduct}`)
            .then(response => {
                const fetchedProduct = response.data;
                setProduct({
                    name: fetchedProduct.name,
                    reference: fetchedProduct.reference,
                    description: fetchedProduct.description,
                    stock: fetchedProduct.stock,
                    category: fetchedProduct.category,
                    brand: fetchedProduct.brand,
                    expiryDate: fetchedProduct.expiryDate,
                });
                JsBarcode("#barcode", fetchedProduct.reference, {
                    format: "CODE128",
                    displayValue: true,
                });
            })
            .catch(error => {
                console.error("Erreur lors de la récupération du produit:", error);
                setErrorMessage("Erreur lors de la récupération du produit");
            });

        axios.get(`/api/products/${idProduct}/photos`)
            .then(response => {
                setPhotos(response.data);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des photos:", error);
                setErrorMessage("Erreur lors de la récupération des photos");
            });
    }, [idProduct]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "reference") {
            const referenceRegex = /^\d*$/;
            if (!referenceRegex.test(value)) {
                setReferenceError("La référence doit contenir uniquement des chiffres.");
            } else {
                setReferenceError("");
                setProduct({ ...product, [name]: value });
                JsBarcode("#barcode", value, {
                    format: "CODE128",
                    displayValue: true,
                });
            }
        } else if (name === "images") {
            const imageFiles = Array.from(files);
            const imagePreviews = imageFiles.map(file => URL.createObjectURL(file));
            setNewPhotos([...newPhotos, ...imageFiles]);
            setPreviewNewPhotos([...previewNewPhotos, ...imagePreviews]);
        } else {
            setProduct({ ...product, [name]: value });
        }
    };

    const handleAltDescriptionChange = (e, index) => {
        const { value } = e.target;
        setAltDescriptions({ ...altDescriptions, [index]: value });
    };

    const handleRemoveExistingPhoto = (photoId) => {
        setPhotosToRemove([...photosToRemove, photoId]);
        setPhotos(photos.filter(photo => photo.idPhoto !== photoId));
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
        setSuccessMessage("");
        setFieldErrors({});

        const categoryValue = product.category || 'non-alimentaire';

        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("reference", product.reference || "");
        formData.append("stock", product.stock || "");
        formData.append("description", product.description || "");
        formData.append("category", categoryValue);
        formData.append("brand", product.brand || "");

        if (categoryValue === 'alimentaire') {
            formData.append("expiryDate", product.expiryDate || "");
        } else {
            formData.append("expiryDate", null);
        }

        newPhotos.forEach((photo, index) => {
            formData.append("images", photo);
            formData.append("altDescriptions", altDescriptions[index] || "");
        });

        try {
            const response = await axios.put(`/api/admin/products/${idProduct}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });

            await Promise.all(
                photosToRemove.map(photoId =>
                    axios.delete(`/api/photos/${photoId}`)
                )
            );

            setSuccessMessage("Produit mis à jour avec succès !");
            setNewPhotos([]);
            setPreviewNewPhotos([]);
            setAltDescriptions({});
            setTimeout(() => {
                navigate("/admin/products");
            }, 1000);

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
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formProductName">
                    <Form.Label>Nom du produit</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                    {fieldErrors.name && <p className="text-danger">{fieldErrors.name}</p>}
                </Form.Group>

                <Form.Group controlId="formProductReference">
                    <Form.Label>Référence</Form.Label>
                    <Form.Control
                        type="text"
                        name="reference"
                        value={product.reference}
                        onChange={handleChange}
                        required
                    />
                    {referenceError && <p className="text-danger">{referenceError}</p>}
                    {fieldErrors.reference && <p className="text-danger">{fieldErrors.reference}</p>}
                    <svg id="barcode"></svg>
                </Form.Group>

                <Form.Group controlId="formProductDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                    />
                    {fieldErrors.description && <p className="text-danger">{fieldErrors.description}</p>}
                </Form.Group>

                <Form.Group controlId="formProductStock">
                    <Form.Label>Stock</Form.Label>
                    <Form.Control
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleChange}
                    />
                    {fieldErrors.stock && <p className="text-danger">{fieldErrors.stock}</p>}
                </Form.Group>

                <Form.Group controlId="formProductCategory">
                    <Form.Label>Catégorie</Form.Label>
                    <Form.Control as="select" name="category" value={product.category} onChange={handleChange} required>
                        <option value="alimentaire">Alimentaire</option>
                        <option value="non-alimentaire">Non-alimentaire</option>
                    </Form.Control>
                    {fieldErrors.category && <p className="text-danger">{fieldErrors.category}</p>}
                </Form.Group>

                <Form.Group controlId="formProductBrand">
                    <Form.Label>Marque</Form.Label>
                    <Form.Control
                        type="text"
                        name="brand"
                        value={product.brand}
                        onChange={handleChange}
                    />
                </Form.Group>

                {product.category === 'alimentaire' && (
                    <Form.Group controlId="formProductExpiryDate">
                        <Form.Label>Date de péremption</Form.Label>
                        <Form.Control
                            type="date"
                            name="expiryDate"
                            value={product.expiryDate}
                            onChange={handleChange}
                            required
                        />
                        {fieldErrors.expiryDate && <p className="text-danger">{fieldErrors.expiryDate}</p>}
                    </Form.Group>
                )}

                <Form.Group controlId="formProductImages">
                    <Form.Label>Images</Form.Label>
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
                    <div onClick={() => document.getElementById("imageUploadInput").click()} className="image-upload-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                        </svg>
                        <span>Ajouter des images</span>
                    </div>
                    <Form.Control
                        type="file"
                        name="images"
                        id="imageUploadInput"
                        onChange={handleChange}
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

                <Button variant="dark" type="submit">
                    Mettre à jour
                </Button>
            </Form>
        </div>
    );
}

export default AdminEditProductPage;
