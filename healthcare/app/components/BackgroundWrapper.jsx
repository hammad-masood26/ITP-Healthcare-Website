const BackgroundWrapper = ({ children }) => {
    return (
      <div
        className="min-h-screen relative"
        style={{
          backgroundImage: "url('/bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="bg-black bg-opacity-60 min-h-screen w-full">
          {children}
        </div>
      </div>
    );
  };
  
  export default BackgroundWrapper;
    