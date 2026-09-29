let selectedBay = null;
let selectedArrival = "Ahora";
let selectedDuration = "1 h";

async function createReservation(vehicleType = "Patineta") {
    const token = getToken();

    const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            bayId: selectedBay.id,
            arrival: selectedArrival,
            duration: selectedDuration,
            vehicleType
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error creando reserva");
    }

    return data;
}

async function getMyReservation() {
    const token = getToken();
    if (!token) return null;

    const response = await fetch("/api/reservations/my", {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
        return null;
    }

    return response.json();
}

async function cancelMyReservation(reservationId) {
    const token = getToken();

    const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error cancelando reserva");
    }

    return data;
}