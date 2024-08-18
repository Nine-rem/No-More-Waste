import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Alert } from 'react-bootstrap';

export default function AdminManageApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        axios.get('/api/admin/applications')
            .then(response => {
                setApplications(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des candidatures:', error);
                setErrorMessage('Erreur lors de la récupération des candidatures.');
            });
    }, []);

    const handleUpdateStatus = (idApplication, status) => {
        axios.patch(`/api/admin/applications/${idApplication}`, { status })
            .then(response => {
                setSuccessMessage('Statut mis à jour avec succès !');
                setApplications(applications.filter(app => app.idApplication !== idApplication));
            })
            .catch(error => {
                console.error('Erreur lors de la mise à jour du statut:', error);
                setErrorMessage('Erreur lors de la mise à jour du statut.');
            });
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Gérer les candidatures</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Bénévole</th>
                        <th>Service</th>
                        <th>Date de soumission</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map(app => (
                        <tr key={app.idApplication}>
                            <td>{app.firstname} {app.lastname}</td>
                            <td>{app.serviceName}</td>
                            <td>{new Date(app.submittedAt).toLocaleString()}</td>
                            <td>
                                <Button 
                                    variant="success" 
                                    onClick={() => handleUpdateStatus(app.idApplication, 'approved')}
                                    className="me-2"
                                >
                                    Approuver
                                </Button>
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleUpdateStatus(app.idApplication, 'rejected')}
                                >
                                    Rejeter
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
