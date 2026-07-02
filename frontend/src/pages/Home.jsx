import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaRobot,
  FaComments,
  FaHouseUser,
  FaUsers,
} from "react-icons/fa";
import { MdApartment } from "react-icons/md";
import { BsGraphUpArrow } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* ================= HERO SECTION ================= */}

      <section className="hero">
        <motion.div
          className="hero-left"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="badge">
            🚀 AI Powered Flatmate Matching
          </span>

          <h1>
            Find Your
            <span> Perfect Room </span>
            & Flatmate
          </h1>

          <p>
            Discover compatible roommates using AI compatibility scoring,
            real-time chat, smart recommendations and instant notifications.
          </p>

          {!user && (
            <div className="hero-buttons">
              <Link to="/register" className="primary-btn">
                Get Started
              </Link>

              <Link to="/login" className="outline-btn">
                Login
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div
          className="hero-right"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="glass-card">
            <h3>⭐ AI Match Score</h3>

            <div className="progress">
              <div className="progress-fill"></div>
            </div>

            <h2>92%</h2>

            <p>Excellent Compatibility</p>
          </div>
        </motion.div>
      </section>

      {/* ================= STATISTICS ================= */}

      <section className="stats">
        <motion.div
          className="stat-card"
          whileHover={{ y: -10 }}
        >
          <MdApartment size={45} color="#6366f1" />

          <h1>250+</h1>

          <p>Active Listings</p>
        </motion.div>

        <motion.div
          className="stat-card"
          whileHover={{ y: -10 }}
        >
          <FaUsers size={42} color="#8b5cf6" />

          <h1>1200+</h1>

          <p>Registered Users</p>
        </motion.div>

        <motion.div
          className="stat-card"
          whileHover={{ y: -10 }}
        >
          <BsGraphUpArrow size={42} color="#06b6d4" />

          <h1>95%</h1>

          <p>AI Match Accuracy</p>
        </motion.div>

        <motion.div
          className="stat-card"
          whileHover={{ y: -10 }}
        >
          <FaComments size={42} color="#10b981" />

          <h1>500+</h1>

          <p>Chats Completed</p>
        </motion.div>
      </section>

      {/* ================= FEATURES ================= */}

      <section className="features">
        <motion.div
          className="feature-card"
          whileHover={{ y: -10 }}
        >
          <FaRobot size={40} />

          <h3>AI Matching</h3>

          <p>
            Claude AI calculates compatibility between tenants and
            owners for smarter roommate matching.
          </p>
        </motion.div>

        <motion.div
          className="feature-card"
          whileHover={{ y: -10 }}
        >
          <FaComments size={40} />

          <h3>Real-Time Chat</h3>

          <p>
            Instantly communicate with room owners after your
            interest request is accepted.
          </p>
        </motion.div>

        <motion.div
          className="feature-card"
          whileHover={{ y: -10 }}
        >
          <FaHouseUser size={40} />

          <h3>Verified Listings</h3>

          <p>
            Browse trusted rooms with advanced search,
            filtering and secure owner verification.
          </p>
        </motion.div>
      </section>
    </div>
  );
}