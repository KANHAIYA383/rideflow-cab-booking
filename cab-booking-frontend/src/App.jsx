import { useState, useEffect } from "react";
import AuthPanel from "./AuthPanel";
import BookingPanel from "./BookingPanel";
import RideHistory from "./RideHistory";
import DriverDashboard from "./DriverDashboard";
import DriverRegistration from "./DriverRegistration";

const rides = [
  { name: 'Mini', detail: 'Affordable everyday rides', icon: '🚗', price: 149 },
  { name: 'Sedan', detail: 'Extra comfort for your journey', icon: '🚘', price: 229 },
  { name: 'SUV', detail: 'Room for everyone', icon: '🚙', price: 349 },
]

function App() {
 const [currentUser, setCurrentUser] = useState(() => {
  try {
    const savedUser = localStorage.getItem("rideflow_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
});

useEffect(() => {
  if (currentUser) {
    localStorage.setItem("rideflow_user", JSON.stringify(currentUser));
  } else {
    localStorage.removeItem("rideflow_user");
  }
}, [currentUser]);
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [selectedRide, setSelectedRide] = useState('Mini')
  const [bookingMessage, setBookingMessage] = useState('')
  const [showDriverRegistration, setShowDriverRegistration] = useState(false);
  const [showDriverDashboard, setShowDriverDashboard] = useState(false);


  const selected = rides.find((ride) => ride.name === selectedRide)

  function handleBooking(event) {
    event.preventDefault()

    if (!pickup.trim() || !destination.trim()) {
      setBookingMessage('Please enter both pickup and destination.')
      return
    }

    setBookingMessage(
      `Your ${selectedRide} estimate is ₹${selected.price}. Connect your account to confirm a real booking.`
    )
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b1120] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-xl font-black text-slate-950">
            R
          </div>
          <span className="text-2xl font-black tracking-tight">
            Ride<span className="text-yellow-400">Flow</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#book" className="transition hover:text-yellow-400">Book a ride</a>
          <a href="#why-us" className="transition hover:text-yellow-400">Why RideFlow</a>
          <a href="#driver" className="transition hover:text-yellow-400">Drive with us</a>
        </nav>

        <button
          onClick={() => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })}
          className="rounded-full bg-yellow-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-yellow-300"
        >
        {currentUser?.role === "DRIVER" && (
          <button
            onClick={() => setShowDriverDashboard((previous) => !previous)}
            className="rounded-full border border-yellow-400 px-4 py-3 text-sm font-bold text-yellow-400"
          >
            {showDriverDashboard ? "Home" : "Driver Dashboard"}
          </button>
        )}
          Book now ↗
        </button>
        <button
          onClick={() => setShowDriverRegistration((previous) => !previous)}
          className="rounded-full border border-yellow-400 px-4 py-3 text-sm font-bold text-yellow-400"
        >
          {showDriverRegistration ? "Home" : "Register as Driver"}
        </button>
      </header>

      
      {showDriverRegistration ? (
        <DriverRegistration
          user={currentUser}
          onRegistered={(data) => {
            console.log("Driver registered:", data);
            setShowDriverRegistration(false);
          }}
        />
      ) : showDriverDashboard && currentUser?.role === "DRIVER" ? (
        <DriverDashboard user={currentUser} />
      ) : (
        <main>

        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-12 lg:grid-cols-2 lg:px-10 lg:pb-28 lg:pt-20">
          <div className="absolute -left-40 top-20 -z-0 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Your city. Your ride. Your time.
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Every journey,
              <span className="mt-2 block text-yellow-400">a little better.</span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
              Your next ride is just a few taps away. Enjoy a simple booking
              experience, transparent estimates, and a smoother way to move.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#book"
                className="rounded-full bg-yellow-400 px-7 py-4 font-bold text-slate-950 shadow-lg shadow-yellow-400/10 transition hover:-translate-y-1 hover:bg-yellow-300"
              >
                Book your ride <span className="ml-2">↗</span>
              </a>
              <a
                href="#why-us"
                className="rounded-full border border-white/15 px-7 py-4 font-semibold transition hover:bg-white/5"
              >
                Explore more
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-7">
              <div>
                <p className="text-2xl font-black">24/7</p>
                <p className="mt-1 text-sm text-slate-500">Booking access</p>
              </div>
              <div>
                <p className="text-2xl font-black">3</p>
                <p className="mt-1 text-sm text-slate-500">Ride categories</p>
              </div>
              <div>
                <p className="text-2xl font-black">Easy</p>
                <p className="mt-1 text-sm text-slate-500">Ride selection</p>
              </div>
            </div>
          </div>

          <div id="book" className="relative z-10">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-yellow-400/10 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-[#121b2d] p-6 shadow-2xl sm:p-8">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-yellow-400">RIDE BOOKING</p>
                  <h2 className="mt-2 text-2xl font-bold">Where to today?</h2>
                  <p className="mt-2 text-sm text-slate-400">Start with your locations.</p>
                </div>
                <div className="rounded-2xl bg-yellow-400/10 p-3 text-2xl">📍</div>
              </div>

              <form onSubmit={handleBooking}>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Pickup location</span>
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b1120] px-4 focus-within:border-yellow-400/70">
                      <span className="text-green-400">●</span>
                      <input
                        value={pickup}
                        onChange={(event) => setPickup(event.target.value)}
                        placeholder="Enter pickup address"
                        className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </label>

                  <div className="ml-5 h-5 border-l border-dashed border-slate-600" />

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Drop-off location</span>
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b1120] px-4 focus-within:border-yellow-400/70">
                      <span className="text-red-400">●</span>
                      <input
                        value={destination}
                        onChange={(event) => setDestination(event.target.value)}
                        placeholder="Where are you going?"
                        className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </label>
                </div>

                <div className="mb-3 mt-7 flex items-center justify-between">
                  <span className="text-sm font-semibold">Choose your ride</span>
                  <span className="text-xs text-slate-500">Sample fares</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {rides.map((ride) => (
                    <button
                      key={ride.name}
                      type="button"
                      onClick={() => {
                        setSelectedRide(ride.name)
                        setBookingMessage('')
                      }}
                      className={`rounded-2xl border p-3 text-left transition ${
                        selectedRide === ride.name
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-white/10 bg-[#0b1120] hover:border-white/30'
                      }`}
                    >
                      <span className="text-2xl">{ride.icon}</span>
                      <span className="mt-2 block font-bold">{ride.name}</span>
                      <span className="mt-1 block text-xs text-slate-400">From ₹{ride.price}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm text-slate-400">Estimated sample fare</p>
                    <p className="mt-1 text-xs text-slate-500">Not a live price</p>
                  </div>
                  <p className="text-2xl font-black text-yellow-400">₹{selected.price}</p>
                </div>

                <button
                  type="submit"
                  className="mt-5 w-full rounded-xl bg-yellow-400 py-4 font-extrabold text-slate-950 transition hover:bg-yellow-300"
                >
                  Find my ride <span className="ml-2">→</span>
                </button>

                {bookingMessage && (
                  <p role="status" className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                    {bookingMessage}
                  </p>
                )}
              </form>

              <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                Demo booking interface · Live driver matching is not connected yet
              </p>
            </div>
          </div>
        </section>

        <section id="why-us" className="border-y border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">The RideFlow difference</p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">Designed around your journey.</h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { icon: '⚡', title: 'Simple booking', description: 'Choose your pickup, destination and preferred ride in one clear flow.' },
                { icon: '🛡️', title: 'Safety-minded', description: 'A foundation for verified driver profiles and secure ride records.' },
                { icon: '💳', title: 'Clear estimates', description: 'See sample fare estimates before connecting a real fare calculation.' },
              ].map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-[#121b2d] p-6 transition hover:-translate-y-1 hover:border-yellow-400/40">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="driver" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 to-transparent p-8 sm:p-12 md:flex-row md:items-center">
            <div>
              <p className="font-bold text-yellow-400">DRIVE WITH RIDEFLOW</p>
              <h2 className="mt-3 text-3xl font-black">Your car. Your opportunity.</h2>
              <p className="mt-3 max-w-xl leading-7 text-slate-400">
                A dedicated driver experience is coming next, with ride requests,
                trip management and earnings.
              </p>
            </div>
            <button
              onClick={() => alert('Driver registration will be connected in a future step.')}
              className="shrink-0 rounded-full bg-white px-7 py-4 font-bold text-slate-950 transition hover:bg-yellow-300"
            >
              Become a driver ↗
            </button>
          </div>
        </section>
      </main>
      )}

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} RideFlow. Made for smoother journeys.</p>
        <p className="mt-2">A cab-booking application project.</p>
      </footer>
      <BookingPanel user={currentUser} />
      <RideHistory user={currentUser} />
      <AuthPanel onUserChange={setCurrentUser} />
    </div>
  )
}

export default App
