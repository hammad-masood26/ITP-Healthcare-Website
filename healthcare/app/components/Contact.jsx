import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc,serverTimestamp } from 'firebase/firestore';

const Contact = () => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const submitData = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!name.trim() || !email.trim() || !message.trim()) {
          alert("Please fill in all fields");
          return;
        }
      
        // Simple email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert("Please enter a valid email address");
          return;
        }
      
        try {
          await addDoc(collection(db, "feedback"), {
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            date: serverTimestamp()
          });
      
          // Reset form
          setName('');
          setEmail('');
          setMessage('');
          
          // Success feedback
          alert("Message sent successfully!");
          
        } catch (error) {
          console.error("Error writing document:", error);
          alert(`Failed to send message. ${error.message}`);
        }
      };

    return (
        <section
            id="contact"
            className="py-16 px-6 md:px-12 lg:px-24 text-[#C69749] text-center bg-black/50 z-0"
        >
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="text-lg text-[#C69749]/80 max-w-2xl mx-auto">
                Have questions, Share Feedback or need a demo? Get in touch with us!
            </p>

            <form
                onSubmit={submitData}
                className="mt-10 max-w-lg mx-auto bg-black/60 p-8 rounded-xl shadow-lg"
            >
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full p-3 mb-4 rounded-md bg-[#282A3A] text-white placeholder-[#C69749]/60 border border-[#735F32] focus:outline-none focus:ring-2 focus:ring-[#C69749]"
                    required
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email"
                    className="w-full p-3 mb-4 rounded-md bg-[#282A3A] text-white placeholder-[#C69749]/60 border border-[#735F32] focus:outline-none focus:ring-2 focus:ring-[#C69749]"
                    required
                />
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your Message"
                    className="w-full p-3 mb-6 rounded-md bg-[#282A3A] text-white placeholder-[#C69749]/60 border border-[#735F32] focus:outline-none focus:ring-2 focus:ring-[#C69749]"
                    rows="5"
                    required
                ></textarea>
                <button
                    type="submit"
                    className="w-full bg-[#C69749] text-[#000000] font-semibold py-3 rounded-md hover:bg-[#735F32] transition-colors duration-300"
                >
                    Send Message
                </button>
            </form>
        </section>
    );
};

export default Contact;
