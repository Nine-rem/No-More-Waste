import {React, useState, useEffect} from 'react';
import axios from 'axios';
import AccountNav from '../accountNav';
import { Link } from 'react-router-dom';
import { UserContext } from '../userContext'; 
import { useContext } from 'react';
import { Button } from 'react-bootstrap';

function adminPage() {
    const { user } = useContext(UserContext);

    return (
        <div>
            <AccountNav/>
            <h1>Admin</h1>
            <p>Vous pouvez consulter ici les informations des utilisateurs</p>
            <Link to="/account/admin/users">
            <Button variant="primary">Liste des utilisateurs</Button>
            </Link>
        </div>
    );
}

export default adminPage;