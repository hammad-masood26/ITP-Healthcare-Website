'use client';

import { assets } from '../../assets/assets';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { auth } from '../../app/firebase/config';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../app/firebase/config';

const Navbar = () => {
    const [isScroll, setIsScroll] = useState(false);
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const sideMenuRef = useRef();

    const openMenu = () => {
        sideMenuRef.current.style.transform = 'translateX(0)';
    };
    const closeMenu = () => {
        sideMenuRef.current.style.transform = 'translateX(100%)';
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScroll(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setUser(user);
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                setUserName(userDoc.exists() ? userDoc.data().name : user.displayName || 'User');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setUserName('');
        setShowDropdown(false);
    };

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    return (
        <>
            <nav
                className={`w-full fixed px-4 lg:px-8 xl:px-[8%] py-4 flex items-center justify-between z-50 transition-all duration-500 ${
                    isScroll ? 'bg-black/50 shadow-md backdrop-blur-md' : 'bg-transparent'
                }`}
            >
                <a href="#top">
                    <Image src={assets.logo} className="w-30 cursor-pointer" alt="Logo" />
                </a>

                {/* Desktop Navigation */}
                <ul
                    className={`hidden md:flex items-center gap-6 lg:gap-8 text-white font-medium`}
                >
                    <li><a className="hover:text-[#C69749] transition" href="#">Home</a></li>
                    <li><a className="hover:text-[#C69749] transition" href="#services">Services</a></li>
                    <li><a className="hover:text-[#C69749] transition" href="#about">About</a></li>
                    <li><a className="hover:text-[#C69749] transition" href="#contact">Contact Us</a></li>
                </ul>

                {/* Right Actions */}
                <div className="flex items-center gap-4 relative">
                    {!user ? (
                        <a
                            href="/sign-in"
                            className="hidden lg:flex items-center gap-3 px-6 py-2 border border-[#C69749] text-[#C69749] font-semibold rounded-full bg-transparent hover:bg-[#C69749]/10 transition"
                        >
                            Login
                            <Image src={assets.arrow_icon} className="w-3 " alt="Arrow Icon" />
                        </a>
                    ) : (
                        <div>
                            <button
                                onClick={toggleDropdown}
                                className="hidden lg:flex items-center gap-2 px-6 py-2 border border-[#C69749] text-white font-semibold rounded-full bg-transparent hover:bg-[#C69749]/10 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5 text-[#C69749]" viewBox="0 0 24 24">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zM12 14.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2V19.2c0-3.2-6.4-4.8-9.6-4.8z" />
                                </svg>
                                {userName.toUpperCase() || 'Welcome'}
                                <span className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg border border-[#C69749]">
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-[#fff2e1] transition">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="block md:hidden ml-3" onClick={openMenu}>
                        <Image src={assets.menu_black} alt="Menu Icon" className="w-6" />
                    </button>
                </div>

                {/* Mobile Menu */}
                <ul
                    ref={sideMenuRef}
                    className="flex md:hidden flex-col gap-6 pt-20 px-8 fixed right-0 top-0 bottom-0 w-64 z-50 h-screen bg-black/90 text-white transition-transform duration-500 transform translate-x-full"
                >
                    <div className="absolute right-6 top-6" onClick={closeMenu}>
                        <Image src={assets.close_black} alt="Close Menu" className="w-5 cursor-pointer invert" />
                    </div>
                    <li><a onClick={closeMenu} href="#top">Home</a></li>
                    <li><a onClick={closeMenu} href="#about">About</a></li>
                    <li><a onClick={closeMenu} href="#services">Services</a></li>
                    <li><a onClick={closeMenu} href="#contact">Contact Us</a></li>
                    {user && (
                        <li>
                            <button onClick={handleLogout} className="w-full text-left py-2 border-t border-[#C69749]">
                                Logout
                            </button>
                        </li>
                    )}
                </ul>
            </nav>
        </>
    );
};

export default Navbar;
