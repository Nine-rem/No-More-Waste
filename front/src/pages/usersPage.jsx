import React, { useContext, useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button, Form, Row, Col } from "react-bootstrap";
import AccountNav from "../accountNav.jsx";
import { UserContext } from "../userContext.jsx";
import axios from "axios";

function UsersPage() {
    const { user, ready } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        if (ready) {
            axios.get('/api/users')
                .then(response => {
                    setUsers(response.data);
                })
                .catch(error => {
                    console.error("There was an error fetching the users!", error);
                });
        }
    }, [ready]);

    const handleBanUser = (userId) => {
        axios.patch(`/api/users/${userId}/ban`)
            .then(response => {
                const updatedStatus = response.data.isBanned;
                setUsers(users.map(user => 
                    user.idUser === userId ? { ...user, isBanned: updatedStatus } : user
                ));
            })
            .catch(error => {
                console.error("There was an error banning the user!", error);
            });
    };

    const filteredUsers = users
        .filter(user => {
            // Filter by role
            if (roleFilter === "all") return true;
            if (roleFilter === "admin") return user.isAdmin;
            if (roleFilter === "merchant") return user.isMerchant;
            if (roleFilter === "volunteer") return user.isVolunteer;
            if (roleFilter === "noRole") return (!user.isAdmin && !user.isMerchant && !user.isVolunteer);
            return false;
        })
        .filter(user => {
            // Search by name or email
            const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
        });

    if (!ready) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div>
            <AccountNav />
            <h1>Users</h1>
            <p>Vous pouvez consulter ici vos utilisateurs</p>

            <Row className="mb-4">
                <Col md={4}>
                    <Form.Control 
                        type="text" 
                        placeholder="Recherche par nom ou email" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col md={4}>
                    <Form.Control 
                        as="select" 
                        value={roleFilter} 
                        onChange={e => setRoleFilter(e.target.value)}
                    >
                        <option value="all">Tous les rôles</option>
                        <option value="admin">Admins</option>
                        <option value="merchant">Marchands</option>
                        <option value="volunteer">Bénévoles</option>
                        <option value="noRole">Sans rôle</option>
                    </Form.Control>
                </Col>
            </Row>

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.idUser}>
                            <td>{user.idUser}</td>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>
                                {user.isAdmin == true && "Admin "}
                                {user.isMerchant == true && "Marchand "}
                                {user.isVolunteer == true && "Bénévole "}
                                {!user.isAdmin && !user.isMerchant && !user.isVolunteer && "Sans rôle"}
                            </td>
                            <td>
                                <Link to={`/account/admin/users/${user.idUser}/edit`}>
                                    <Button variant="warning" className="mr-2">Edit</Button>
                                </Link>
                                <Button 
                                    variant={user.isBanned ? "success" : "danger"} 
                                    onClick={() => handleBanUser(user.idUser)}
                                >
                                    {user.isBanned ? "Unban" : "Ban"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UsersPage;
