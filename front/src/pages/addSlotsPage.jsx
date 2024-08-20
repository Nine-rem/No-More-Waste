import React, { useState, useEffect } from "react";
import { Button, Form, Alert, Col, Row, Card, Container } from "react-bootstrap";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, startOfToday, parseISO } from "date-fns";

const DAYS_OF_WEEK = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const TIME_SLOTS = Array.from({ length: 96 }, (_, i) => {
    const hours = String(Math.floor(i / 4)).padStart(2, '0');
    const minutes = String((i % 4) * 15).padStart(2, '0');
    return `${hours}:${minutes}`;
});

export default function AddSlotsPage() {
    const { idService } = useParams();
    const navigate = useNavigate();
    const [selectedSlots, setSelectedSlots] = useState({});
    const [expandedDay, setExpandedDay] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        // Fetch the already selected slots from the API when the component mounts
        const fetchSelectedSlots = async () => {
            try {
                const response = await axios.get(`/api/services/${idService}/slots`);
                console.log("API Response:", response.data); // Debugging statement
                const fetchedSlots = response.data;

                // Validate the structure of fetchedSlots
                if (!Array.isArray(fetchedSlots)) {
                    throw new Error("Invalid data format received from API");
                }

                // Transform the fetched slots into the selectedSlots state structure
                const transformedSlots = fetchedSlots.reduce((acc, slot) => {
                    try {
                        const parsedDate = slot.date ? parseISO(slot.date) : null;  // Parse the date if it exists
                        if (!parsedDate || isNaN(parsedDate)) throw new Error(`Invalid date format: ${slot.date}`);

                        const day = format(parsedDate, 'EEEE', { locale: 'fr' });
                        if (!acc[day]) {
                            acc[day] = {};
                        }
                        acc[day][slot.time] = true;
                    } catch (error) {
                        console.error(`Error processing slot: ${JSON.stringify(slot)}.`, error);
                    }
                    return acc;
                }, {});

                setSelectedSlots(transformedSlots);
            } catch (error) {
                console.error("Erreur lors de la récupération des créneaux horaires :", error);
                setErrorMessage("Erreur lors de la récupération des créneaux horaires.");
            }
        };

        fetchSelectedSlots();
    }, [idService]);

    const getNextDateForDay = (day) => {
        const daysOfWeek = {
            "Lundi": 1,
            "Mardi": 2,
            "Mercredi": 3,
            "Jeudi": 4,
            "Vendredi": 5,
            "Samedi": 6,
            "Dimanche": 0,
        };

        const today = new Date();
        const todayDay = today.getDay();  // 0 (dimanche) à 6 (samedi)
        const targetDay = daysOfWeek[day];

        if (targetDay === undefined) {
            console.error(`Jour invalide : ${day}`);
            return null;
        }

        const daysUntilNext = (targetDay + 7 - todayDay) % 7;
        return addDays(startOfToday(), daysUntilNext);
    };

    const handleSlotChange = (day, time) => {
        setSelectedSlots((prevState) => ({
            ...prevState,
            [day]: {
                ...prevState[day],
                [time]: !prevState[day]?.[time]
            }
        }));
    };

    const handleHourSelect = (day, hour, e) => {
        e.stopPropagation();  // Prevent the day card from collapsing
        const hourSlots = TIME_SLOTS.filter(slot => slot.startsWith(hour));
        const allSelected = hourSlots.every(slot => selectedSlots[day]?.[slot]);

        setSelectedSlots(prevState => {
            const updatedDaySlots = { ...prevState[day] };

            hourSlots.forEach(slot => {
                updatedDaySlots[slot] = !allSelected;
            });

            return {
                ...prevState,
                [day]: updatedDaySlots
            };
        });
    };

    const handleDayClick = (day) => {
        setExpandedDay(expandedDay === day ? null : day);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const slotsToSubmit = [];

        for (const [day, times] of Object.entries(selectedSlots)) {
            const date = getNextDateForDay(day);
            if (date) {
                const formattedDate = format(date, 'yyyy-MM-dd');
                for (const [time, isSelected] of Object.entries(times)) {
                    if (isSelected) {
                        slotsToSubmit.push({ date: formattedDate, time });
                    }
                }
            } else {
                console.error(`Impossible de soumettre, la date pour le jour ${day} est invalide.`);
                setErrorMessage("Une ou plusieurs dates sont invalides. Veuillez vérifier vos sélections.");
                return;
            }
        }

        if (slotsToSubmit.length === 0) {
            setErrorMessage("Aucun créneau horaire sélectionné.");
            return;
        }

        try {
            await axios.post(`/api/services/${idService}/slots`, { slots: slotsToSubmit }, {
                withCredentials: true,
            });
            setSuccessMessage("Créneaux horaires ajoutés avec succès !");
            setSelectedSlots({});
            setTimeout(() => {
                navigate("/account/volunteer/myServices");
            }, 2000); // Redirige après 2 secondes vers MyServices
        } catch (error) {
            console.error("Erreur lors de l'ajout des créneaux horaires :", error);
            setErrorMessage("Erreur lors de l'ajout des créneaux horaires.");
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Ajouter des créneaux horaires</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="mb-3">
                        <Card className="p-3" onClick={() => handleDayClick(day)} style={{ cursor: "pointer" }}>
                            <h5 className="text-center mb-3">{day}</h5>
                            {expandedDay === day && (
                                <Row className="align-items-center">
                                    {TIME_SLOTS.map((time, index) => {
                                        const hour = time.split(":")[0];
                                        const isFirstSlotOfHour = time.endsWith(":00");

                                        return (
                                            <Col key={time} xs={3} md={2} lg={1} className="mb-2">
                                                {isFirstSlotOfHour && (
                                                    <div className="hour-selector text-center">
                                                        <Form.Check 
                                                            type="checkbox"
                                                            label={`${hour}h`}
                                                            onClick={(e) => handleHourSelect(day, hour, e)}
                                                        />
                                                    </div>
                                                )}
                                                <div className="time-slot text-center">
                                                    <Button 
                                                        variant={selectedSlots[day]?.[time] ? "success" : "outline-secondary"}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent day toggle when selecting a slot
                                                            handleSlotChange(day, time);
                                                        }}
                                                        style={{ width: "100%" }}
                                                    >
                                                        {time}
                                                    </Button>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            )}
                        </Card>
                    </div>
                ))}
                <div className="text-center mt-4">
                    <Button variant="primary" type="submit">Ajouter les créneaux horaires</Button>
                </div>
            </Form>
        </Container>
    );
}
