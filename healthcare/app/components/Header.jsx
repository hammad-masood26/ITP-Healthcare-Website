'use client';

import { assets } from '../../assets/assets';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { auth } from '../../app/firebase/config';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div
      className="relative"
      style={{
        backgroundImage: "url('/bg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // height: '120vh',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay for dark tint */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Content */}
      <div className="relative z-10 w-11/12 max-w-3xl text-center mx-auto h-screen flex flex-col items-center justify-center gap-4 pt-24 text-[#C69749]">
        <h1 className="text-4xl sm:text-6xl font-bold">Revolutionize HealthCare with ITP</h1>
        <p className="max-w-2xl mx-auto text-[#C69749]/80 text-lg">
          To achieve better healthcare and well-being, focus on prevention through regular check-ups, a balanced diet, and consistent physical activity.
           Incorporate stress management techniques like mindfulness, quality sleep, and social support to reduce the risk of chronic illnesses.
            These simple habits can lead to a healthier, longer, and more fulfilling life.
        </p>

        {/* Conditionally show buttons only if user is NOT logged in */}
        {!user && (
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <a
              href="/sign-up"
              className="px-10 py-3 border rounded-full border-[#C69749] text-[#C69749] flex items-center gap-2 hover:bg-[#C69749] hover:text-black transition"
            >
              Get Started <Image src={assets.right_arrow_white} alt="" className="w-4" />
            </a>
            <a
              href="/sign-up"
              className="px-10 py-3 border rounded-full border-[#C69749] text-[#C69749] flex items-center gap-2 hover:bg-[#C69749] hover:text-black transition"
            >
              Request a Demo <Image src={assets.right_arrow_white} alt="" className="w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
