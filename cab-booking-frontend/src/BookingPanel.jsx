
import { useState } from "react";

const API_URL = "http://localhost:8080/api/rides";

const vehicleRates = {
  Mini: { base: 40, perKm: 12 },
  Sedan: { base: 70, perKm: 16 },
  SUV: { base: 100, perKm: 22 },
};

export default function BookingPanel({ user }) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [vehicleType, setVehicleType] = useState("Mini");
  const [distanceKm, setDistanceKm] = useState("10");
  const [message, setMessage] = useState("");
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);

  const distance = Number(distanceKm);
  const rates = vehicleRates[vehicleType];

  const estimatedFare =
    distance > 0 && distance <= 1000
      ? rates.base + rates.perKm * distance
      : null;

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    marginBottom: "16px",
    border: "1px solid #334155",
    borderRadius: "8px",
    background: "#111827",
    color: "#f8fafc",
    fontSize: "15px",
    boxSizing: "border-box",
  };

  async function bookRide(event) {
    event.preventDefault();
    setMessage("");
    setRide(null);

    if (!user?.id) {
      setMessage("Please log in before booking a ride.");
      return;
    }

    if (pickup.trim().toLowerCase() === dropoff.trim().toLowerCase()) {
      setMessage("Pickup and destination must be different.");
      return;
    }

    if (!Number.isFinite(distance) || distance <= 0 || distance > 1000) {
      setMessage("Enter a distance greater than 0 and at most 1000 km.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderId: user.id,
          pickupLocation: pickup.trim(),
          dropoffLocation: dropoff.trim(),
          vehicleType,
          distanceKm: distance,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          data.error || data.message || `Booking failed (${response.status}).`
        );
        return;
      }

      setRide(data);
      setMessage("Ride booked successfully!");
      setPickup("");
      setDropoff("");
    } catch {
      setMessage(
        "Cannot connect to the backend. Check that Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="book-ride"
      style={{
        maxWidth: "600px",
        margin: "48px auto",
        padding: "28px",
        border: "1px solid #263449",
        borderRadius: "18px",
        background: "#111827",
        color: "#f8fafc",
      }}
    >
      <h2 style={{ fontSize: "26px", marginTop: 0 }}>Book Your Ride</h2>
      <p style={{ color: "#94a3b8" }}>
        Choose your vehicle and see your estimated fare.
      </p>

      {!user && (
        <p style={{ color: "#facc15" }}>
          Please log in using the rider account section before booking.
        </p>
      )}

      <form onSubmit={bookRide}>
        <label>
          Pickup location
          <input
            style={inputStyle}
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            maxLength={255}
            placeholder="e.g. Railway Station"
            required
          />
        </label>

        <label>
          Drop-off location
          <input
            style={inputStyle}
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            maxLength={255}
            placeholder="e.g. City Centre"
            required
          />
        </label>

        <label>
          Select vehicle
          <select
            style={inputStyle}
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="Mini">Mini — ₹40 base + ₹12/km</option>
            <option value="Sedan">Sedan — ₹70 base + ₹16/km</option>
            <option value="SUV">SUV — ₹100 base + ₹22/km</option>
          </select>
        </label>

        <label>
          Trip distance in kilometres (demo)
          <input
            style={inputStyle}
            type="number"
            min="0.1"
            max="1000"
            step="0.1"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            required
          />
        </label>

        <div
          style={{
            padding: "18px",
            marginBottom: "18px",
            borderRadius: "12px",
            background: "#1e293b",
          }}
        >
          <p style={{ margin: "0 0 8px", color: "#94a3b8" }}>
            Estimated fare
          </p>
          <h2 style={{ margin: 0, color: "#facc15", fontSize: "32px" }}>
            {estimatedFare === null
              ? "Enter a valid distance"
              : `₹${estimatedFare.toFixed(2)}`}
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: 0 }}>
            Base ₹{rates.base} + ₹{rates.perKm}/km
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !user?.id || estimatedFare === null}
          style={{
            width: "100%",
            padding: "13px",
            border: "none",
            borderRadius: "8px",
            background: "#facc15",
            color: "#111827",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {loading ? "Submitting..." : "Request Ride"}
        </button>
      </form>

      {message && (
        <p role="status" aria-live="polite" style={{ marginTop: "18px" }}>
          {message}
        </p>
      )}

      {ride && (
        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "10px",
            background: "#1e293b",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Booking Confirmation</h3>
          <p>Ride ID: {ride.id}</p>
          <p>Pickup: {ride.pickupLocation}</p>
          <p>Destination: {ride.dropoffLocation}</p>
          <p>Vehicle: {ride.vehicleType}</p>
          <p>Distance: {ride.distanceKm} km</p>
          <p>
            <strong>Fare: ₹{Number(ride.fare).toFixed(2)}</strong>
          </p>
          <p>Status: {ride.status}</p>
        </div>
      )}
    </section>
  );
}
