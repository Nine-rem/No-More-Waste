import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { UserContext } from '../userContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import '../style/merchantProductPage.css';
import AccountNav from '../accountNav.jsx';

function MerchantProductPage() {
    const { user, ready } = useContext(UserContext);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        if (ready && user) {
            axios.get(`/api/users/${user.idUser}/products`)
                .then(response => {
                    setProducts(response.data);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des produits:", error);
                });
        }
    }, [ready, user]);

    if (!ready) {
        return <div>Chargement...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    const handleCardClick = (productId) => {
        navigate(`/account/merchant/editProduct/${productId}`);
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            axios.delete(`/api/products/${productId}`)
                .then(response => {
                    setProducts(products.filter(product => product.idProduct !== productId));
                })
                .catch(error => {
                    console.error("Erreur lors de la suppression du produit:", error);
                });
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterCategory(e.target.value);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        console.log(product.category, filterCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <>
        <AccountNav />
        <Container>
            <Row className="my-4">
                <Col>
                    <h1>Vos Produits</h1>
                    <p>Voici la liste de vos produits avec les détails correspondants.</p>
                </Col>
                <Col className="text-right">
                    <Link to="/account/merchant/addProduct">
                        <Button variant="dark">Ajouter un Produit</Button>
                    </Link>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Control 
                        type="text" 
                        placeholder="Rechercher un produit..." 
                        value={searchQuery} 
                        onChange={handleSearchChange} 
                    />
                </Col>
                <Col md={6}>
                    <Form.Control 
                        as="select" 
                        value={filterCategory} 
                        onChange={handleFilterChange}
                    >
                        <option value="all">Toutes les catégories</option>
                        <option value="alimentaire">Alimentaire</option>
                        <option value="non-alimentaire">Non-alimentaire</option>
                    </Form.Control>
                </Col>
            </Row>
            <Row className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <Col key={product.idProduct} sm={12} md={6} lg={4} className="mb-4">
                            <Card className="product-card">
                                {product.photos && product.photos.length > 0 ? (
                                    <Card.Img variant="top" src={product.photos[0].fullPath} alt={product.name} />
                                ) : (
                                    <div className="no-image-placeholder">Aucune image</div>
                                )}
                                <Card.Body>
                                    <Card.Title>{product.name}</Card.Title>
                                    <Card.Text>
                                        {product.reference}<br />
                                        {product.stock} en stock
                                    </Card.Text>
                                    <Button variant="dark" onClick={() => handleCardClick(product.idProduct)}>Modifier le Produit</Button>
                                    <Button variant="danger" onClick={() => handleDeleteProduct(product.idProduct)} className="ml-2">Supprimer</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <Card>
                            <Card.Body>
                                <Card.Title>Aucun produit trouvé</Card.Title>
                                <Card.Text>
                                    Il semble que vous n'ayez pas encore ajouté de produits. Commencez à en ajouter pour les voir ici.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
        </Container>
        </>
    );
}

export default MerchantProductPage;
