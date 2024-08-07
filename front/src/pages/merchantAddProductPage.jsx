import React, { useState, useContext } from "react";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
import { UserContext } from "../userContext.jsx";
import { Navigate } from "react-router-dom";
import "../style/merchantAddProductPage.css";
function MerchantAddProductPage() {
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        images: []
    });

    const { user } = useContext(UserContext);
    if (!user) {
        return <Navigate to="/login" />;
    }

    const [previewImages, setPreviewImages] = useState([]);
    const [altDescriptions, setAltDescriptions] = useState({});

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "images") {
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

        updatedImages.splice(index, 1);
        updatedPreviews.splice(index, 1);

        setProductData({ ...productData, images: updatedImages });
        setPreviewImages(updatedPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", productData.name);
        formData.append("description", productData.description);
        formData.append("price", productData.price);
        formData.append("stock", productData.stock);

        productData.images.forEach((image, index) => {
            formData.append("images", image);
            formData.append("altDescriptions", altDescriptions[index] || "");
        });

        // Debug: Log FormData content
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        try {
            await axios.post("/api/products", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            alert("Produit ajouté avec succès !");
            setProductData({
                name: "",
                description: "",
                price: "",
                stock: "",
                images: []
            });
            setPreviewImages([]);
            setAltDescriptions({});
        } catch (error) {
            console.error("Erreur lors de l'ajout du produit", error);
            alert("Erreur lors de l'ajout du produit");
        }
    };

    const handleImageUploadClick = () => {
        document.getElementById("imageUploadInput").click();
    };

    return (
        <div>
            <h1>Ajouter un produit</h1>
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
                </Form.Group>

                <Form.Group controlId="formProductDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formProductPrice">
                    <Form.Label>Prix</Form.Label>
                    <Form.Control
                        type="number"
                        name="price"
                        value={productData.price}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formProductStock">
                    <Form.Label>Stock</Form.Label>
                    <Form.Control
                        type="number"
                        name="stock"
                        value={productData.stock}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formProductImages">
                    <Form.Label>Images</Form.Label>
                    <div onClick={handleImageUploadClick} style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                        </svg>
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

                <div className="image-previews">
                    {previewImages.map((src, index) => (
                        <div key={index} className="preview-container">
                            <img src={src} alt={`Preview ${index}`} className="preview-image" />
                            <Form.Control
                                type="text"
                                placeholder="Petite description"
                                value={altDescriptions[index] || ""}
                                onChange={(e) => handleAltDescriptionChange(e, index)}
                            />
                            <Button variant="danger" onClick={() => handleRemoveImage(index)}>Supprimer</Button>
                        </div>
                    ))}
                </div>

                <Button variant="primary" type="submit">
                    Ajouter
                </Button>
            </Form>
        </div>
    );
}

export default MerchantAddProductPage;
