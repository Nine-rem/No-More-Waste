import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AllProductsPage() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des produits:", error);
            });
    }, []);

    const filteredProducts = products.filter(product => {
        const productName = product.name || '';
        return productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
               (categoryFilter === 'all' || product.category === categoryFilter);
    });

    const handleCardClick = (idProduct) => {
        navigate(`/products/${idProduct}`);
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1>Tous les Produits</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Control 
                        type="text" 
                        placeholder="Rechercher un produit..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col>
                    <Form.Select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Toutes les catégories</option>
                        <option value="alimentaire">Alimentaire</option>
                        <option value="non-alimentaire">Non-Alimentaire</option>
                    </Form.Select>
                </Col>
            </Row>
            <Row className="product-grid mt-4">
                {filteredProducts.map(product => (
                    <Col key={product.idProduct} sm={12} md={6} lg={4} className="mb-4">
                        <Card className="product-card" onClick={() => handleCardClick(product.idProduct)} style={{ cursor: 'pointer' }}>
                            {product.photos && product.photos.length > 0 ? (
                                <Card.Img variant="top" src={product.photos[0].fullPath} alt={product.name} />
                            ) : (
                                <div className="no-image-placeholder">Aucune image</div>
                            )}
                            <Card.Body>
                                <Card.Title>{product.name}</Card.Title>
                                <Card.Text>
                                    {product.reference}<br />
                                    {product.stock} en stock<br />
                                    {product.category}<br />
                                    {product.brand}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default AllProductsPage;
