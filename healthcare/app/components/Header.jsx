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
    <div className="relative min-h-dvh">
      {/* Overlay for dark tint */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Content */}
      <div className="relative z-10 w-11/12 max-w-3xl text-center mx-auto min-h-dvh flex flex-col items-center justify-center gap-4 py-28 sm:py-32 text-[#C69749]">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">Revolutionize HealthCare with ITP</h1>
        <p className="max-w-2xl mx-auto text-white/80 text-base sm:text-lg leading-7 sm:leading-8">
          To achieve better healthcare and well-being, focus on prevention through regular check-ups, a balanced diet, and consistent physical activity.
           Incorporate stress management techniques like mindfulness, quality sleep, and social support to reduce the risk of chronic illnesses.
            These simple habits can lead to a healthier, longer, and more fulfilling life.
        </p>

        {/* Conditionally show buttons only if user is NOT logged in */}
        {!user && (
          <div className="flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-4 mt-6">
            <a
              href="/sign-up"
              className="w-full sm:w-auto justify-center px-8 sm:px-10 py-3 border rounded-full border-[#C69749] text-[#C69749] flex items-center gap-2 hover:border-white hover:text-white transition"
            >
              Get Started <Image src={assets.right_arrow_white} alt="" className="w-4" />
            </a>
            <a
              href="/sign-up"
              className="w-full sm:w-auto justify-center px-8 sm:px-10 py-3 border rounded-full border-[#C69749] text-[#C69749] flex items-center gap-2 hover:border-white hover:text-white transition"
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
