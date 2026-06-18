const About = () => {
  return (
    <section
      id="about"
      className="py-16 px-4 sm:px-6 md:px-12 lg:px-24 text-white bg-black/50 z-0"
    >
      <h2 className="text-3xl font-bold mb-10 text-center text-[#C69749]">About Us</h2>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 max-w-6xl mx-auto">
        {/* Developer Image Frame */}
        <div className="w-48 h-48 sm:w-64 sm:h-64 flex-shrink-0 border-4 border-[#C69749] rounded-2xl overflow-hidden shadow-lg">
          <img
            src='\hammadpic.jpeg'
            alt="Developer"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Developer Details */}
        <div className="text-center lg:text-left max-w-xl">
          <p className="text-base sm:text-lg text-white/80 leading-relaxed">
            <strong>ITP</strong> is transforming healthcare through smart Electronic Health Records (EHR) solutions—streamlining
            medical data, enhancing patient care, and empowering providers with secure, efficient digital tools.
            <br /><br />
            Built by <strong>Hammad Masood</strong>, a <strong>Computer Systems Engineer</strong> and
            <strong> Full-Stack Developer</strong> from <strong>Mehran University Jamshoro</strong>, this project combines
            modern web technologies with a passion for making healthcare smarter, faster, and more accessible for everyone.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
