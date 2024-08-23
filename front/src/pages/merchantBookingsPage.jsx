import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { UserContext } from '../userContext.jsx';
import AccountNav from '../accountNav.jsx';
import { format } from 'date-fns'; 

function MerchantBookingsPage() {
    const { user, ready } = useContext(UserContext);
    const [bookings, setBookings] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (ready && user) {
            axios.get(`/api/merchant/${user.idUser}/bookings`)
                .then(response => {
                    setBookings(response.data);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des réservations:", error);
                    setErrorMessage("Erreur lors de la récupération des réservations.");
                });
        }
    }, [ready, user]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, 'dd-MM-yyyy'); // Formater la date en dd-mm-yyyy
    };

    return (
        <>
            <AccountNav />
            <Container className="mt-5">
                <h1 className="text-center mb-4">Mes Réservations</h1>
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                {bookings.length > 0 ? (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Date</th>
                                <th>Heure</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.idReservation}>
                                    <td>{booking.serviceName}</td>
                                    <td>{formatDate(booking.date)}</td>
                                    <td>{booking.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Alert variant="info">Vous n'avez aucune réservation pour le moment.</Alert>
                )}
            </Container>
        </>
    );
}

export default MerchantBookingsPage;
