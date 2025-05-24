'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTwitter,
  faLinkedin,
  faFacebook,
  faInstagram,
  faGithub,
} from '@fortawesome/free-brands-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-[#000000] text-[#C69749] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start text-center md:text-left">
          
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start">
            <Image
              src={assets.logo}
              alt="ITP Logo"
              width={200}
              height={200}
              className="mb-4"
            />
            <p className="text-sm text-[#C69749]/80 max-w-xs">
              Revolutionizing healthcare through AI and smart systems for a better tomorrow.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#C69749]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#top" className="hover:text-white">Home</Link></li>
              <li><Link href="#services" className="hover:text-white">Services</Link></li>
              <li><Link href="#about" className="hover:text-white">About</Link></li>
              <li><Link href="#contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Social Media for Both Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#C69749]">Connect With Us</h3>

            {/* Raza Khan */}
            <div className="mb-6">
              <p className="font-medium mb-2">Raza Khan</p>
              <div className="flex justify-center md:justify-start gap-4">
                <a href="https://www.linkedin.com/in/raza-khan-922612296/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white text-xl">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
                <a href="https://www.facebook.com/raza.khanzada.756" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white text-xl">
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
                <a href="https://www.instagram.com/_raza_kz?igsh=MTRqbXV3eWxuMGt2bw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white text-xl">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="https://github.com/Razakhan143" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white text-xl">
                  <FontAwesomeIcon icon={faGithub} />
                </a>
              </div>
            </div>

            {/* Hammad Masood */}
            <div>
              <p className="font-medium mb-2">Hammad Masood</p>
              <div className="flex justify-center md:justify-start gap-4">
                <a href="https://www.linkedin.com/in/hammad-masood26?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white text-xl">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
                <a href="https://www.facebook.com/share/1ATtRDSk9Y/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white text-xl">
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
                <a href="https://www.instagram.com/hammad_masood26?igsh=dW01NnZiajhnaDd6" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white text-xl">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="https://github.com/hammad-masood26" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white text-xl">
                  <FontAwesomeIcon icon={faGithub} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-10 border-[#735F32]" />

        {/* Footer bottom text */}
        <div className="text-center text-sm text-[#735F32]">
          &copy; {new Date().getFullYear()} ITP — All rights reserved. Built with ❤️ by Raza Khan and Hammad Masood.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
