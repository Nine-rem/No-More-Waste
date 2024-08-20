import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card } from 'react-bootstrap';

function ProductPage() {
    const { idProduct } = useParams();
    const [product, setProduct] = useState(null);
    console.log(idProduct);

    useEffect(() => {
        axios.get(`/api/products/${idProduct}`)
            .then(response => {
                setProduct(response.data);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération du produit:", error);
            });
    }, [idProduct]);

    if (!product) {
        return <div>Chargement...</div>;
    }

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1>{product.name}</h1>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    {product.photos.length > 0 ? (
                        <img src={product.photos[0].fullPath} alt={product.name} className="img-fluid" />
                    ) : (
                        <div className="no-image-placeholder">Aucune image</div>
                    )}
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>{product.name}</Card.Title>
                            <Card.Text>
                                Marque: {product.brand}<br />
                                Description: {product.description}
                                Catégorie: {product.category}<br />
                                Stock: {product.stock} unités<br />
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ProductPage;
