
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DriverLiveMap from "./DriverLiveMap";



const API_URL = "http://localhost:8080/api/rides";

function RideStatusTimeline({ status }) {
  const steps = [
    { key: "REQUESTED", label: "Ride Requested" },
    { key: "ACCEPTED", label: "Driver Accepted" },
    { key: "IN_PROGRESS", label: "Ride In Progress" },
    { key: "COMPLETED", label: "Ride Completed" },
  ];

  const currentIndex = steps.findIndex(
    (step) => step.key === status
  );

  const isCancelled = status === "CANCELLED";
  const isRejected = status === "REJECTED";

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "16px",
        border: "1px solid #334155",
        borderRadius: "12px",
        background: "#0f172a",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#e2e8f0" }}>
        Ride Progress
      </h3>

      {isCancelled || isRejected ? (
        <p style={{ color: "#fca5a5", marginBottom: 0 }}>
          {isCancelled ? "Ride Cancelled" : "Ride Rejected"}
        </p>
      ) : (
        <div>
          {steps.map((step, index) => {
            const completed = currentIndex >= index;
            const isCurrent = currentIndex === index;

            return (
              <div
                key={step.key}
                style={{
                  display: "flex",
                  gap: "12px",
                  minHeight: index === steps.length - 1 ? "32px" : "58px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "28px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: completed ? "#166534" : "#334155",
                      color: "#ffffff",
                      fontWeight: "700",
                      border: isCurrent
                        ? "2px solid #86efac"
                        : "2px solid transparent",
                      boxSizing: "border-box",
                    }}
                  >
                    {completed ? "✓" : index + 1}
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      style={{
                        width: "2px",
                        flex: 1,
                        minHeight: "20px",
                        background: currentIndex > index
                          ? "#22c55e"
                          : "#475569",
                      }}
                    />
                  )}
                </div>

                <div style={{ paddingBottom: "18px" }}>
                  <div
                    style={{
                      color: completed ? "#f8fafc" : "#94a3b8",
                      fontWeight: isCurrent ? "700" : "500",
                    }}
                  >
                    {step.label}
                  </div>

                  {isCurrent && (
                    <div
                      style={{
                        color: "#86efac",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Current status
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


export default function RideHistory({ user }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [trackingLocations, setTrackingLocations] = useState({});
  const [trackingErrors, setTrackingErrors] = useState({});
  
  useEffect(() => {
    const activeRides = rides.filter(
      (ride) => ride.status === "IN_PROGRESS"
    );

    if (activeRides.length === 0) {
      setTrackingLocations({});
      setTrackingErrors({});
      return;
    }

    let cancelled = false;

    async function loadTrackingLocations() {
      await Promise.all(
        activeRides.map(async (ride) => {
          try {
            const response = await fetch(
              `${API_URL}/${ride.id}/tracking`,
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.error || "Could not load driver location."
              );
            }

            if (cancelled) return;

            if (
              data.driverLatitude != null &&
              data.driverLongitude != null
            ) {
              setTrackingLocations((previous) => ({
                ...previous,
                [ride.id]: data,
              }));

              setTrackingErrors((previous) => ({
                ...previous,
                [ride.id]: "",
              }));
            } else {
              setTrackingErrors((previous) => ({
                ...previous,
                [ride.id]: data.message || "Waiting for driver location...",
              }));
            }
          } catch (error) {
            if (!cancelled) {
              setTrackingErrors((previous) => ({
                ...previous,
                [ride.id]: error.message || "Tracking unavailable.",
              }));
            }
          }
        })
      );
    }

    loadTrackingLocations();

    const intervalId = window.setInterval(
      loadTrackingLocations,
      5000
    );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [rides]);


  useEffect(() => {
    if (!user?.id) {
      setRides([]);
      setError("");
      setLastUpdated(null);
      return;
    }

    const controller = new AbortController();
    let isFirstLoad = true;

    async function loadRides() {
      if (isFirstLoad) {
        setLoading(true);
      }

      try {
        const response = await fetch(
        `${API_URL}/rider/${user.id}`,
        {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load ride history."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        setRides(data);
        setError("");
        setLastUpdated(new Date());
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load ride history.");
        }
      } finally {
        if (!controller.signal.aborted) {
          isFirstLoad = false;
          setLoading(false);
        }
      }
    }

    loadRides();

    const intervalId = window.setInterval(() => {
      loadRides();
    }, 5000);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [user?.id]);

  const panelStyle = {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "24px",
    border: "1px solid #263449",
    borderRadius: "16px",
    background: "#111827",
    color: "#f8fafc",
  };

  function refreshRides() {
    // Trigger a fresh fetch without reloading the entire app.
    setRefreshKey((previous) => previous + 1);
  }

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user?.id || refreshKey === 0) return;

    const controller = new AbortController();

    async function refresh() {
      try {
        
        const response = await fetch(
          `${API_URL}/rider/${user.id}`,
          {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not refresh rides.");
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        setRides(data);
        setError("");
        setLastUpdated(new Date());
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to refresh ride history.");
        }
      }
    }

    refresh();

    return () => controller.abort();
  }, [refreshKey, user?.id]);

  if (!user?.id) {
    return (
      <section id="my-rides" style={panelStyle}>
        <h2>My Rides</h2>
        <p>Please log in to view your ride history.</p>
      </section>
    );
  }

  return (
    <section id="my-rides" style={panelStyle}>
      <h2 style={{ fontSize: "26px", marginTop: 0 }}>
        My Rides
      </h2>

      <p style={{ color: "#94a3b8" }}>
        Your previous and current ride requests.
      </p>

      <p style={{ color: "#94a3b8", fontSize: "13px" }}>
        Live status refreshes automatically every 5 seconds.
        {lastUpdated &&
          ` Last checked: ${lastUpdated.toLocaleTimeString()}`}
      </p>

      {loading && <p>Loading your rides...</p>}

      {error && (
        <p role="alert" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      )}

      {!loading && !error && rides.length === 0 && (
        <p>No rides yet. Book your first ride to see it here.</p>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {rides.map((ride) => (
          <article
            key={ride.id}
            style={{
              padding: "18px",
              border: "1px solid #334155",
              borderRadius: "12px",
              background: "#1e293b",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <strong>Ride #{ride.id}</strong>

              <span style={{ color: "#facc15", fontWeight: "700" }}>
                {(ride.status || "REQUESTED").replaceAll("_", " ")}
              </span>
            </div>

            <p>
              <strong>Pickup:</strong>{" "}
              {ride.pickupLocation || "Not available"}
            </p>

            <p>
              <strong>Destination:</strong>{" "}
              {ride.dropoffLocation || "Not available"}
            </p>

            {ride.vehicleType && (
              <p>
                <strong>Vehicle:</strong> {ride.vehicleType}
              </p>
            )}

            {ride.distanceKm != null && (
              <p>
                <strong>Distance:</strong> {ride.distanceKm} km
              </p>
            )}

            {ride.fare != null && (
              <p>
                <strong>Fare:</strong> ₹{ride.fare}
              </p>
            )}

            {ride.createdAt && (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                Booked: {new Date(ride.createdAt).toLocaleString()}
              </p>
            )}
            
          {ride.status === "IN_PROGRESS" && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                border: "1px solid #3b82f6",
                borderRadius: "12px",
                background: "#172554",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#93c5fd" }}>
                📍 Live Driver Tracking
              </h3>

              {trackingLocations[ride.id] ? (
                <>
                  <p>
                    <strong>Latitude:</strong>{" "}
                    {trackingLocations[ride.id].driverLatitude}
                  </p>

                  <p>
                    <strong>Longitude:</strong>{" "}
                    {trackingLocations[ride.id].driverLongitude}
                  </p>

                  
                  <p style={{ color: "#bfdbfe", fontSize: "13px" }}>
                    <strong>Last location update:</strong>{" "}
                    {trackingLocations[ride.id].locationUpdatedAt
                      ? new Date(
                          trackingLocations[ride.id].locationUpdatedAt
                        ).toLocaleTimeString()
                      : "Time unavailable"}
                  </p>

                  {(() => {
                    const updatedAt = trackingLocations[ride.id].locationUpdatedAt;
                    const ageSeconds = updatedAt
                      ? (Date.now() - new Date(updatedAt).getTime()) / 1000
                      : null;

                    const isFresh = ageSeconds !== null &&
                      Number.isFinite(ageSeconds) &&
                      ageSeconds >= -30 &&
                      ageSeconds <= 20;

                    return (
                      <p
                        style={{
                          color: isFresh ? "#86efac" : "#fbbf24",
                          fontSize: "13px",
                          fontWeight: "700",
                        }}
                      >
                        {isFresh
                          ? "🟢 GPS location is up to date"
                          : "🟡 Waiting for a recent GPS update"}
                      </p>
                    );
                  })()}


                  
                  <DriverLiveMap
                    latitude={trackingLocations[ride.id].driverLatitude}
                    longitude={trackingLocations[ride.id].driverLongitude}
                    updatedAt={trackingLocations[ride.id].locationUpdatedAt}
                  />

                </>
              ) : (
                <p style={{ color: "#bfdbfe" }}>
                  {trackingErrors[ride.id] ||
                    "Waiting for the driver's GPS location..."}
                </p>
              )}

              <p style={{ color: "#93c5fd", fontSize: "12px" }}>
                Location refreshes every 5 seconds.
              </p>
            </div>
          )}
          <RideStatusTimeline status={ride.status || "REQUESTED"} />

          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={refreshRides}
        style={{
          marginTop: "20px",
          padding: "10px 16px",
          border: "none",
          borderRadius: "8px",
          background: "#facc15",
          color: "#111827",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        Refresh Ride History
      </button>
    </section>
  );
}

