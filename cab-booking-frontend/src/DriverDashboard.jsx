import { useCallback, useEffect, useRef, useState } from "react";

const API = "http://localhost:8080/api";

export default function DriverDashboard({ user }) {
  const [rides, setRides] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [loadingMyRides, setLoadingMyRides] = useState(false);
  const [driverId, setDriverId] = useState(
    localStorage.getItem("rideflow_driver_id") || ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [trackingRideId, setTrackingRideId] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const watchIdRef = useRef(null);


  
  const loadRides = useCallback(async () => {
    if (!driverId || !Number.isInteger(Number(driverId)) || Number(driverId) <= 0) {
      setRides([]);
      return;
    }

    setLoading(true);

    try {
      
const response = await fetch(
  `${API}/driver/rides/available?driverId=${driverId}`,
  {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }
);


      if (!response.ok) {
        throw new Error("Could not load available rides");
      }

      setRides(await response.json());
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [driverId, user?.token]);

  
const loadMyRides = useCallback(async () => {
  if (!driverId || !Number.isInteger(Number(driverId)) || Number(driverId) <= 0) {
    setMyRides([]);
    return;
  }

  setLoadingMyRides(true);

  try {
    
const response = await fetch(
  `${API}/driver/rides/my-rides/${driverId}`,
  {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }
);

    if (!response.ok) {
      throw new Error("Could not load your accepted rides.");
    }

    const data = await response.json();
    setMyRides(data);
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoadingMyRides(false);
  }
}, [driverId, user?.token]);

  const loadAvailability = useCallback(async () => {
    if (!driverId || !Number.isInteger(Number(driverId)) || Number(driverId) <= 0) {
      setIsAvailable(false);
      return;
    }

    try {
      
const response = await fetch(
  `${API}/drivers/${driverId}/availability`,
  {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }
);


      if (!response.ok) {
        throw new Error("Could not load driver availability.");
      }

      const data = await response.json();
      setIsAvailable(data.available);
    } catch (error) {
      setMessage(error.message);
    }
  }, [driverId, user?.token]);



  useEffect(() => {
    loadRides();
  }, [loadRides]);

  useEffect(() => {
  loadMyRides();
}, [loadMyRides]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);



  async function handleAction(rideId, action) {
    if (!driverId || !Number.isInteger(Number(driverId))) {
      setMessage("Enter your registered driver ID first.");
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `${API}/driver/rides/${rideId}/${action}`,
        {
          method: "POST",
          headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${user.token}`,
},
          body: JSON.stringify({ driverId: Number(driverId) }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Action failed");

      setMessage(data.message);
      await loadRides();
      await loadMyRides();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function saveDriverId() {
    if (!driverId || !Number.isInteger(Number(driverId)) || Number(driverId) <= 0) {
      setMessage("Enter a valid positive driver ID.");
      return;
    }
    localStorage.setItem("rideflow_driver_id", driverId);
    setMessage("Driver ID saved in this browser.");
  }

  
  async function toggleAvailability() {
    if (!driverId || !Number.isInteger(Number(driverId)) || Number(driverId) <= 0) {
      setMessage("Enter and save your registered driver ID first.");
      return;
    }

    setAvailabilityLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/drivers/${driverId}/availability`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ available: !isAvailable }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update availability.");
      }

      setIsAvailable(data.available);
      setMessage(data.message);
      await loadRides();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setAvailabilityLoading(false);
    }
  }
  
  useEffect(() => {
    const activeRide = myRides.find(
      (ride) => ride.status === "IN_PROGRESS"
    );

    if (!activeRide || !driverId) {
      if (
        watchIdRef.current !== null &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = null;
      setTrackingRideId(null);
      setLocationStatus("");
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus("GPS is not supported by this browser.");
      return;
    }

    setTrackingRideId(activeRide.id);
    setLocationStatus("Requesting GPS permission...");

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          const response = await fetch(
            `${API}/driver/rides/${activeRide.id}/location`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({
                driverId: Number(driverId),
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Could not share your location."
            );
          }

          setLocationStatus(
            `Location shared at ${new Date().toLocaleTimeString()}`
          );
        } catch (error) {
          setLocationStatus(
            error.message || "Unable to share location."
          );
        }
      },
      (error) => {
        setLocationStatus(
          `Location unavailable: ${error.message}`
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    watchIdRef.current = watchId;

    return () => {
      navigator.geolocation.clearWatch(watchId);

      if (watchIdRef.current === watchId) {
        watchIdRef.current = null;
      }
    };
  }, [myRides, driverId]);



  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 text-white">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
          RideFlow • Driver
        </p>
        <h1 className="mt-2 text-3xl font-bold">Driver Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Welcome{user?.name ? `, ${user.name}` : ""}. View and manage ride requests.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <label className="mb-2 block text-sm text-slate-300">
          Your registered driver ID
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            type="number"
            min="1"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            placeholder="Enter driver ID"
            className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white"
          />
          <button
            onClick={saveDriverId}
            className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-950"
          >
            Save ID
          </button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div>
          <h2 className="text-lg font-semibold">Driver availability</h2>
          <p className="mt-1 text-sm text-slate-400">
            Current status: {isAvailable ? "Online" : "Offline"}
          </p>
        </div>

        <button
          onClick={toggleAvailability}
          disabled={availabilityLoading || !driverId}
          className={`rounded-xl px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
            isAvailable
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {availabilityLoading
            ? "Updating..."
            : isAvailable
              ? "Go Offline"
              : "Go Online"}
        </button>
      </div>


      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Available rides</h2>
        <button
          onClick={loadRides}
          disabled={loading}
          className="rounded-xl border border-slate-600 px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {message && (
        <p className="mb-4 rounded-xl border border-slate-700 bg-slate-900 p-3">
          {message}
        </p>
      )}

      {!loading && rides.length === 0 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
          <h3 className="text-lg font-semibold">No available rides</h3>
          <p className="mt-2 text-slate-400">
            New ride requests will appear here when you refresh.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {rides.map((ride) => (
          <article
            key={ride.id}
            className="rounded-2xl border border-slate-700 bg-slate-900 p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="font-semibold">Ride #{ride.id}</span>
              <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-sm text-yellow-300">
                {ride.status}
              </span>
            </div>

            <p className="mb-2 text-sm text-slate-400">PICKUP</p>
            <p className="mb-4 break-words">{ride.pickupLocation}</p>

            <p className="mb-2 text-sm text-slate-400">DESTINATION</p>
            <p className="mb-4 break-words">{ride.dropoffLocation}</p>

            <div className="mb-5 flex flex-wrap justify-between gap-3 text-sm">
              <span>{ride.vehicleType}</span>
              <span>{ride.distanceKm} km</span>
              <strong className="text-yellow-400">
                ₹{ride.fare}
              </strong>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAction(ride.id, "accept")}
                className="flex-1 rounded-xl bg-yellow-400 px-4 py-3 font-bold text-slate-950"
              >
                Accept ride
              </button>
              <button
                onClick={() => handleAction(ride.id, "reject")}
                className="flex-1 rounded-xl border border-slate-600 px-4 py-3 font-semibold"
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>

      
    <div className="mt-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">My Accepted Rides</h2>
        <button
          onClick={loadMyRides}
          disabled={loadingMyRides}
          className="rounded-xl border border-slate-600 px-4 py-2 disabled:opacity-50"
        >
          {loadingMyRides ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {myRides.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
          <p className="text-slate-400">
            No rides have been assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myRides.map((ride) => (
            <article
              key={ride.id}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="font-semibold">Ride #{ride.id}</span>
                <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-sm text-yellow-300">
                  {ride.status}
                </span>
              </div>

              
              {ride.status === "ACCEPTED" && (
                <button
                  onClick={() => handleAction(ride.id, "start")}
                  className="mt-4 w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-slate-950"
                >
                  Start Ride
                </button>
              )}

              {ride.status === "IN_PROGRESS" && (
                <button
                  onClick={() => handleAction(ride.id, "complete")}
                  className="mt-4 w-full rounded-xl bg-green-500 px-4 py-3 font-bold text-white"
                >
                  Complete Ride
                </button>
              )}
              {ride.status === "IN_PROGRESS" && (
              <div className="mt-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
                <p className="text-sm font-semibold text-blue-300">
                  📍 Live GPS Tracking
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {trackingRideId === ride.id
                    ? locationStatus || "Starting GPS tracking..."
                    : "Preparing GPS tracking..."}
                </p>
              </div>
            )}


              <p className="mb-1 text-sm text-slate-400">PICKUP</p>
              <p className="mb-4 break-words">{ride.pickupLocation}</p>

              <p className="mb-1 text-sm text-slate-400">DESTINATION</p>
              <p className="mb-4 break-words">{ride.dropoffLocation}</p>

              <div className="flex justify-between gap-3 text-sm">
                <span>{ride.vehicleType}</span>
                <strong className="text-yellow-400">₹{ride.fare}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>

    </section>
  );
}
