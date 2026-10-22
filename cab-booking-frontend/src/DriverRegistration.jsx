
import { useState } from "react";

const API = "http://localhost:8080/api";

export default function DriverRegistration({ user, onRegistered }) {
  const [form, setForm] = useState({
    licenseNumber: "",
    vehicleModel: "",
    vehicleNumber: "",
    vehicleType: "Mini",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch(`${API}/drivers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Driver registration failed.");
      }

      setMessage(
        `Registration successful! Your driver ID is ${data.driverId}.`
      );

      if (onRegistered) onRegistered(data);
    } catch (err) {
      setError(true);
      setMessage(
        err.message || "Could not connect to the server. Check the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!user?.id) {
    return (
      <section className="mx-auto max-w-xl px-4 py-10 text-white">
        <p>Please log in with your rider account before registering as a driver.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-10 text-white">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-yellow-400">
        RideFlow • Become a driver
      </p>
      <h1 className="mb-2 text-3xl font-bold">Driver Registration</h1>
      <p className="mb-6 text-slate-400">
        Enter your driving licence and vehicle details.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-6"
      >
        <div>
          <label className="mb-2 block text-sm">Driving licence number</label>
          <input
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={updateField}
            required
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3"
            placeholder="Enter licence number"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Vehicle model</label>
          <input
            name="vehicleModel"
            value={form.vehicleModel}
            onChange={updateField}
            required
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3"
            placeholder="e.g. Maruti Swift"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Vehicle registration number</label>
          <input
            name="vehicleNumber"
            value={form.vehicleNumber}
            onChange={updateField}
            required
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3"
            placeholder="e.g. JH05AB1234"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Vehicle type</label>
          <select
            name="vehicleType"
            value={form.vehicleType}
            onChange={updateField}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3"
          >
            <option value="Mini">Mini</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register as Driver"}
        </button>

        {message && (
          <p
            role="status"
            className={`rounded-xl p-3 ${
              error
                ? "border border-red-500/40 bg-red-500/10 text-red-300"
                : "border border-green-500/40 bg-green-500/10 text-green-300"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
