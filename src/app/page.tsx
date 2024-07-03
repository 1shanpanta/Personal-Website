import { FaGithub, FaLinkedinIn, FaTwitter } from "react-icons/fa";

export default function Home() {
  return (
    <div className="relative h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/bg_image.jpg)' }}>
        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      {/* Content */}
      <div className="flex flex-col items-center justify-center h-full relative">
        <h1 className="text-3xl  text-white mb-4">Ishan Panta</h1>
        <h2 className="text-3xl text-white mb-8">AI | ML| Robotics</h2>
        <div className="flex space-x-4">
          {/* Social Media Icons */}
          <a href="https://twitter.com/1shanpanta" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="w-6 h-6 text-white hover:text-blue-40 transition-colors duration-300" />
          </a>
          <a href="https://www.linkedin.com/in/1shanpanta" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn className="w-7 h-7 text-white hover:text-blue-60 transition-colors duration-300" />
          </a>
          <a href="https://github.com/1shanpanta" target="_blank" rel="noopener noreferrer">
            <FaGithub className="w-6 h-6 text-white hover:text-gray-70 transition-colors duration-300" />
          </a>
        </div>
      </div>
    </div>
  );
}
