'use client';

import { useRouter } from 'next/navigation';
import { FaRobot } from 'react-icons/fa';
import { GiHealthNormal, GiMeditation } from 'react-icons/gi';
import { auth } from '../firebase/config'; // Import auth from your Firebase config
import { useEffect } from 'react';

const Services = () => {
  const router = useRouter();

  const services = [
    {
      id: 1,
      icon: <GiHealthNormal size={40} className="text-[#C69749] mb-4" />,
      title: 'Disease',
      description: 'Utilize our AI models by providing your symptoms. Receive analysis to potentially predict possible health outcomes and explore correlations with various diseases and medical conditions for insights.',
      link: '/prediction',
    },
    {
      id: 2,
      icon: <GiMeditation size={40} className="text-[#C69749] mb-4" />,
      title: 'Mental Health Analyzer',
      description: 'Explore mental health topics and gain understanding. Add text to our AI analyzer for instant information and insights into various aspects of well-being and related health information.',
      link: '/mental_health',
    },
    {
      id: 3,
      icon: <FaRobot size={40} className="text-[#C69749] mb-4" />,
      title: 'Medical Assistance ChatBot',
      description: 'Get instant medical insights by asking about symptoms, treatments, causes, and more. Our AI-powered assistant is here to provide you with trusted medical information.',
      link: '/medical_assistance',
    },
  ];

  // Check if user is logged in and redirect if not
  const handleServiceClick = (link) => {
    const user = auth.currentUser; // Check current user state
    if (!user) {
      router.push('/sign-in'); // Redirect to login if not authenticated
    } else {
      router.push(link); // Proceed to the service page if authenticated
    }
  };

  return (
    <section id="services" className="min-h-screen px-4 py-20 text-white bg-black/50 z-0">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12 text-[#C69749]">Our AI Services</h2>
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-white leading-relaxed mb-4">
            At <strong>ITP</strong>, we are committed to revolutionizing healthcare through cutting-edge AI technology. Our innovative AI Services are designed to empower you with intelligent health insights and personalized medical support.
          </p>
          
          <ul className="text-white leading-relaxed space-y-3 text-left max-w-2xl mx-auto mb-6">
            <li>✓ <strong>Disease Predictor</strong> - Analyze symptoms and receive potential health predictions with insights into various diseases and conditions</li>
            <li>✓ <strong>Mental Health Analyzer</strong> - Explore mental health topics and get instant analysis for better well-being</li>
            <li>✓ <strong>Medical Assistant ChatBot</strong> - Get instant medical insights by asking about symptoms, treatments, and causes</li>
          </ul>
          
          <p className="text-white text-center font-semibold">
            Try these innovative services now to experience a new level of personalized healthcare!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-black/40 border border-[#C69749]/30 backdrop-blur-md rounded-xl shadow-xl p-6 text-center hover:shadow-2xl transition duration-300"
            >
              {service.icon}
              <h3 className="text-xl font-semibold mb-1 text-white">{service.title}</h3>
              <p className="text-gray-300 mb-4">{service.description}</p>
              <button
                onClick={() => handleServiceClick(service.link)}
                className="mt-1 bg-[#C69749] text-black font-semibold px-6 py-2 rounded-full hover:bg-[#735F32] transition"
              >
                TRY NOW!
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;