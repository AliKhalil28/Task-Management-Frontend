"use client";
import {
  CheckSquare,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/AliKhalil28",
      icon: Github,
    },
    {
      name: "Twitter",
      href: "https://x.com/ChAliKhalil1",
      icon: Twitter,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/ali-khalil-753469285/",
      icon: Linkedin,
    },
    {
      name: "Email",
      href: "mailto:alikhalil.webdev@gmail.com",
      icon: Mail,
    },
  ];

  return (
    <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Brand Section */}
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">TaskFlow</span>
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                Streamline your productivity with our intuitive task management
                platform. Organize, prioritize, and accomplish your goals
                efficiently.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center text-gray-400 text-sm mb-4 md:mb-0">
              <span>© {currentYear} TaskFlow. All rights reserved.</span>
              <span className="mx-2"></span>
              <span className="flex items-center">
                Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> by Ali
                Khalil
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
