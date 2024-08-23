import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function AdminProductPage() {
    const [products, setProducts] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/admin/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des produits:', error);
                setErrorMessage('Erreur lors de la récupération des produits.');
            });
    }, []);

    const handleEditProduct = (idProduct) => {
        navigate(`/account/admin/products/${idProduct}/edit`);
    };

    const handleDeleteProduct = (idProduct) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            axios.delete(`/api/admin/products/${idProduct}`)
                .then(() => {
                    setProducts(products.filter(product => product.idProduct !== idProduct));
                })
                .catch(error => {
                    console.error('Erreur lors de la suppression du produit:', error);
                    setErrorMessage('Erreur lors de la suppression du produit.');
                });
        }
    };

    return (
        <Container className="mt-5">
            <h1>Gestion des Produits</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Référence</th>
                        <th>Stock</th>
                        <th>Marque</th>
                        <th>Catégorie</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.idProduct}>
                            <td>{product.idProduct}</td>
                            <td>{product.name}</td>
                            <td>{product.reference}</td>
                            <td>{product.stock}</td>
                            <td>{product.brand}</td>
                            <td>{product.category}</td>
                            <td>
                                <Button variant="warning" onClick={() => handleEditProduct(product.idProduct)}>Modifier</Button>
                                <Button variant="danger" onClick={() => handleDeleteProduct(product.idProduct)} className="ml-2">Supprimer</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}
