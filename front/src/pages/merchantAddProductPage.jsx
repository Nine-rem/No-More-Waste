import React, { useState, useContext, useEffect } from "react";
import { Button, Form, Alert, Col, Row, Card } from "react-bootstrap";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../userContext.jsx";
import JsBarcode from "jsbarcode";

function MerchantAddProductPage() {
    const [productData, setProductData] = useState({
        name: "",
        reference: "",
        description: "",
        stock: "",
        category: "non-alimentaire",
        brand: "",
        expiryDate: "",
        images: []
    });

    const { user, ready } = useContext(UserContext);
    const [previewImages, setPreviewImages] = useState([]);
    const [altDescriptions, setAltDescriptions] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [referenceError, setReferenceError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (productData.reference && !referenceError) {
            JsBarcode("#barcode", productData.reference, {
                format: "CODE128",
                displayValue: true,
            });
        }
    }, [productData.reference, referenceError]);

    if (!ready) {
        return null;
    }
    if (!user || !user.idUser) {
        return <Navigate to="/login" />;
    }

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "reference") {
            const referenceRegex = /^\d*$/; // Regex pour vérifier que seuls les chiffres sont autorisés
            if (!referenceRegex.test(value)) {
                setReferenceError("La référence doit contenir uniquement des chiffres.");
            } else {
                setReferenceError("");
                setProductData({ ...productData, [name]: value });
            }
        } else if (name === "images") {
            const imageFiles = Array.from(files);
            const imagePreviews = imageFiles.map((file) => URL.createObjectURL(file));
            setProductData({ ...productData, images: [...productData.images, ...imageFiles] });
            setPreviewImages([...previewImages, ...imagePreviews]);
        } else {
            setProductData({ ...productData, [name]: value });
        }
    };

    const handleAltDescriptionChange = (e, index) => {
        const { value } = e.target;
        setAltDescriptions({ ...altDescriptions, [index]: value });
    };

    const handleRemoveImage = (index) => {
        const updatedImages = [...productData.images];
        const updatedPreviews = [...previewImages];

        URL.revokeObjectURL(previewImages[index]);

        updatedImages.splice(index, 1);
        updatedPreviews.splice(index, 1);

        setProductData({ ...productData, images: updatedImages });
        setPreviewImages(updatedPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");
        setFieldErrors({});

        const formData = new FormData();
        formData.append("name", productData.name);
        formData.append("reference", productData.reference || "");
        formData.append("stock", productData.stock || "");
        formData.append("description", productData.description || "");
        formData.append("category", productData.category);
        formData.append("brand", productData.brand || "");

        if (productData.category === 'alimentaire') {
            formData.append("expiryDate", productData.expiryDate || "");
        }

        productData.images.forEach((image, index) => {
            formData.append("images", image);
            formData.append("altDescriptions", altDescriptions[index] || "");
        });

        try {
            const response = await axios.post(`/api/products`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true
            });

            setSuccessMessage(response.data.message);
            setProductData({
                name: "",
                reference: "",
                description: "",
                stock: "",
                category: "non-alimentaire",
                brand: "",
                expiryDate: "",
                images: []
            });
            setPreviewImages([]);
            setAltDescriptions({});

            setTimeout(() => {
                navigate("/account/merchant/products");  // Redirection après 2 secondes
            }, 2000);

        } catch (error) {
            if (error.response && error.response.data.errors) {
                setFieldErrors(error.response.data.errors);
            } else if (error.response && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("Erreur lors de l'ajout du produit");
            }
        }
    };

    return (
        <div className="product-page">
            <h1>Ajouter un produit</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formProductName">
                    <Form.Label>Nom du produit</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={productData.name}
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
                        value={productData.reference}
                        onChange={handleChange}
                        required
                    />
                    {referenceError && <p className="text-danger">{referenceError}</p>}
                    {fieldErrors.reference && <p className="text-danger">{fieldErrors.reference}</p>}
                    <svg id="barcode"></svg> {/* Zone de rendu du code-barres */}
                </Form.Group>

                <Form.Group controlId="formProductDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                    />
                    {fieldErrors.description && <p className="text-danger">{fieldErrors.description}</p>}
                </Form.Group>

                <Form.Group controlId="formProductStock">
                    <Form.Label>Stock</Form.Label>
                    <Form.Control
                        type="number"
                        name="stock"
                        value={productData.stock}
                        onChange={handleChange}
                    />
                    {fieldErrors.stock && <p className="text-danger">{fieldErrors.stock}</p>}
                </Form.Group>

                <Form.Group controlId="formProductCategory">
                    <Form.Label>Catégorie</Form.Label>
                    <Form.Control as="select" name="category" value={productData.category} onChange={handleChange} required>
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
                        value={productData.brand}
                        onChange={handleChange}
                    />
                </Form.Group>

                {productData.category === 'alimentaire' && (
                    <Form.Group controlId="formProductExpiryDate">
                        <Form.Label>Date de péremption</Form.Label>
                        <Form.Control
                            type="date"
                            name="expiryDate"
                            value={productData.expiryDate}
                            onChange={handleChange}
                            required
                        />
                        {fieldErrors.expiryDate && <p className="text-danger">{fieldErrors.expiryDate}</p>}
                    </Form.Group>
                )}

                <Form.Group controlId="formProductImages">
                    <Form.Label>Images</Form.Label>
                    <div onClick={() => document.getElementById("imageUploadInput").click()} className="image-upload-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 svg-icon">
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
                    {previewImages.map((src, index) => (
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
                                    <Button variant="danger" onClick={() => handleRemoveImage(index)}>Supprimer</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Button variant="primary" type="submit">
                    Ajouter
                </Button>
            </Form>
        </div>
    );
}

export default MerchantAddProductPage;
