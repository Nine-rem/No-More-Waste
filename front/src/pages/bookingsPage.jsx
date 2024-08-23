import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';
import AccountNav from '../accountNav.jsx';

function BookingsPage() {
    return (
        <>
            <AccountNav />

                <h1 className="mb-4">Gestion des Réservations</h1>

                        <Link to="/account/merchant/bookings">
                            <Button variant="dark">Consulter mes Réservations</Button>
                        </Link>

                        <Link to="/account/merchant/reserve-service">
                            <Button variant="dark">Réserver un Service</Button>
                        </Link>

        </>
    );
}

export default BookingsPage;
