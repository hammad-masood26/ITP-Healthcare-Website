const About = () => {
  return (
    <section
      id="about"
      className="py-16 px-6 md:px-12 lg:px-24 text-[#C69749] bg-black/50 z-0"
    >
      <h2 className="text-3xl font-bold mb-10 text-center">About Us</h2>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">
        {/* Developer Image Frame */}
        <div className="w-64 h-64 border-4 border-[#C69749] rounded-2xl overflow-hidden shadow-lg">
          <img
            src='\hammadpic.jpeg' 
            alt="Developer"
            className=" "
          />
        </div>

        {/* Developer Details */}
        <div className="text-left max-w-xl">
          <p className="text-lg text-[#C69749]/80 leading-relaxed">
            At <strong>ITP</strong>, we are revolutionizing the healthcare industry through cutting-edge Electronic Health
            Records (EHR) solutions. Our mission is to streamline medical data management, enhance patient care, and empower
            healthcare providers with intelligent, secure, and efficient digital tools.
            <br /><br />
            I'm <strong>Hammad Masood</strong>, a passionate <strong>Computer Systems
              Engineer</strong> and <strong>MERN Stack Developer</strong> with expertise in <strong>React, Next.js,
                Node.js, Express, MongoDB, and Firebase.</strong> I specialize in building
            scalable backend systems and responsive web applications, delivering high-performance e-commerce platforms,
            business solutions, and AI-powered applications. With a focus on modern JavaScript frameworks, cloud
            integration, and real-world problem-solving, I bring efficient, full-stack solutions to domains like healthcare,
            HR systems, and marketplaces.
            <br /><br />
            As a student of <strong>Mehran University Jamshoro </strong>and a competitive project contributor, I bring a
            unique blend of
            academic discipline and real-world impact. From disease prediction to mental health analytics web apps, I’m
            committed to transforming the way healthcare is delivered—making it smarter, faster, and more accessible for
            everyone.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
