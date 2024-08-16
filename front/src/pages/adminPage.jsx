import { React, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AccountNav from '../accountNav';
import { UserContext } from '../userContext'; 
import { Button } from 'react-bootstrap';

function AdminPage() {
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
            <h1>Admin</h1>
            <p>Vous pouvez effectuer ici l'administration du site</p>
            <Link to="/account/admin/users">
                <Button variant="primary">Liste des utilisateurs</Button>
            </Link>
            <Link to="/account/admin/subscriptions">
                <Button variant="primary">Liste des abonnements</Button>
            </Link>
        </div>
    );
}

export default AdminPage;
