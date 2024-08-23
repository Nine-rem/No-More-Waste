import { React, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AccountNav from '../accountNav';
import { UserContext } from '../userContext'; 
import { Button } from 'react-bootstrap';

function AdminManageServicesPage() {
    const { user, ready } = useContext(UserContext);

    // Si les données ne sont pas encore prêtes, affichez un message de chargement
    if (!ready) {
        return <div>Loading...</div>;
    }

    // Si l'utilisateur n'est pas connecté ou que isAdmin est null/false, rediriger
    if (!user || user.isAdmin !== 1) {
        return <Navigate to="/404/" />;
    }

    return (
        <div>
            <AccountNav />
            <h1>Gestion des services</h1>
            <p>Vous pouvez effectuer ici la gestion des services</p>
            <Link to="/account/admin/services/list">
                <Button variant="dark">Liste des services</Button>
            </Link>
            <Link to="/account/admin/services/applications">
                <Button variant="dark">Candidature des bénévoles</Button>
            </Link>
   
                
        </div>
    );
}

export default AdminManageServicesPage;
