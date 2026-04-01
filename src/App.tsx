import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ExperiencePage from './pages/ExperiencePage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import WorkPage from './pages/WorkPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import LavaLampBackground from './components/LavaLampBackground';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col relative">
        <LavaLampBackground />
        <Navbar />
        
        <main className="flex-grow pt-32 pb-24 relative overflow-hidden">
          <Routes>
            <Route path="/" element={<ExperiencePage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<AdminPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
