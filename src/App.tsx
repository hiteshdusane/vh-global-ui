import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import QueryProvider from './context/QueryProvider';
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import ProductPage from './pages/ProductPage';
import PageLayout from './components/PageLayout';
import { MotionConfig } from 'framer-motion';
import Analytics from './components/Analytics';

function AboutRedirect({ section = '' }: { section?: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: '/about', search, hash: hash || section }} replace />;
}

function App() {
  return (
    <QueryProvider>
      <Router>
        <Analytics />
        <MotionConfig reducedMotion="user">
        <div className="site-shell min-h-screen">
          <Header />
          <PageLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            {/* <Route path="/products/:productId" element={<ProductDetail />} /> */}
              <Route path="/products/:productId" element={<ProductPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/company" element={<AboutRedirect />} />
            <Route path="/cocopeat-specs" element={<AboutRedirect section="#cocopeat-expertise" />} />
            <Route path="/cocopeat-spec" element={<AboutRedirect section="#cocopeat-expertise" />} />
            <Route path="/contact" element={<Contact />} /> 
          </Routes>
          </PageLayout>
          <Footer />
        </div>
        </MotionConfig>
      </Router>
    </QueryProvider>
  );
}

export default App;
