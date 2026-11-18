import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar, { Footer } from "./components/Navbar.jsx";
import { Protected } from "./auth.jsx";
import Home from "./pages/Home.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EventForm from "./pages/EventForm.jsx";
import Attendees from "./pages/Attendees.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/my-bookings" element={<Protected role="customer"><MyBookings /></Protected>} />
          <Route path="/dashboard" element={<Protected role="organizer"><Dashboard /></Protected>} />
          <Route path="/dashboard/new" element={<Protected role="organizer"><EventForm /></Protected>} />
          <Route path="/dashboard/events/:id/edit" element={<Protected role="organizer"><EventForm /></Protected>} />
          <Route path="/dashboard/events/:id/attendees" element={<Protected role="organizer"><Attendees /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
