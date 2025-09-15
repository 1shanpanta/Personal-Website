import { FaGithub, FaLinkedinIn, FaMedium } from "react-icons/fa";

export default function Home() {
  return (
    <div className="relative h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/bg_image.jpg)' }}>
        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      {/* Content */}
      <div className="flex flex-col items-center justify-center h-full relative px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Ishan Panta</h1>
        <h2 className="text-xl md:text-3xl text-white mb-8">AI | Web Dev | Robotics</h2>
        <div className="flex space-x-6">
          {/* Social Media Icons */}
          <a href="https://medium.com/@1shanpanta" target="_blank" rel="noopener noreferrer">
            <FaMedium className="w-8 h-8 md:w-6 md:h-6 text-white hover:text-blue-400 transition-colors duration-300" />
          </a>
          <a href="https://www.linkedin.com/in/1shanpanta" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn className="w-8 h-8 md:w-7 md:h-7 text-white hover:text-blue-600 transition-colors duration-300" />
          </a>
          <a href="https://github.com/1shanpanta" target="_blank" rel="noopener noreferrer">
            <FaGithub className="w-8 h-8 md:w-6 md:h-6 text-white hover:text-gray-400 transition-colors duration-300" />
          </a>
        </div>
      </div>
    </div>
  );
}
