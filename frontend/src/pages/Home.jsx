import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { StarIcon, UsersIcon, TrophyIcon, AcademicCapIcon, HeartIcon, GlobeAltIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/Navbar';
import HeroImage from '../components/HeroImage';
import { useTheme } from '../hooks/useTheme';
import Footer from '../components/Footer';

function Home() {
  const { darkMode } = useTheme();
  const bg = darkMode ? 'bg-[#23272F]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const highlight = 'text-[#00CC00]';
  const cardBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-[#F5F5F5]';
  const secondary = darkMode ? 'text-[#B2B2B2]' : 'text-[#666666]';
  const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { delay, duration: 0.9, ease: 'easeOut' } },
  });

  return (
    <div className={`min-h-screen w-full flex flex-col ${bg} ${text} font-sans transition-colors duration-300`} style={{ fontFamily: 'Lato, sans-serif' }}>
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet" />
        <title>EchoAid | Learn Sign Language</title>
      </Helmet>
      <Navbar />
      
      {/* Animated playful background shape */}
      <motion.div className="hidden md:block absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00CC00]/10 rounded-full blur-3xl z-0" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 10 }} />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-16 px-4 relative z-10">
        {/* Hero Section */}
        <motion.section
          className="w-full flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 mt-4 mb-12"
          {...fadeIn(0.2)}
        >
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1.1, ease: 'easeOut' }}
            className="order-2 lg:order-1"
          >
            <HeroImage className="mx-auto" />
          </motion.div>
          {/* Headline and CTA */}
          <div className="flex flex-col items-center lg:items-start max-w-xl order-1 lg:order-2 text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-block bg-gradient-to-r from-[#00CC00] to-[#00AA00] text-white text-sm font-bold px-4 py-2 rounded-full mb-4 shadow-lg">
                🎯 #1 Sign Language Learning Platform
              </span>
            </div>
            <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6 text-[#00CC00] drop-shadow-[0_4px_12px_rgba(0,204,0,0.3)]">
              The free, fun, and effective way to learn sign language!
            </h1>
            <p className={`text-lg sm:text-xl lg:text-2xl font-normal mb-8 ${secondary} max-w-2xl leading-relaxed`}>
              Master signs through interactive lessons, earn badges, and join a deaf-friendly community with EchoAid.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
              <Link
                to="/signup"
                className="bg-gradient-to-r from-[#00CC00] to-[#00AA00] text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#00CC00]/50 text-center transform hover:-translate-y-1"
                aria-label="Get Started"
              >
                🚀 Get Started Free
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section className="w-full max-w-6xl mx-auto px-4" {...fadeIn(0.5)}>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Why Choose EchoAid?</h2>
            <p className={`text-lg sm:text-xl ${secondary} max-w-3xl mx-auto`}>
              Join thousands of learners who have transformed their communication skills
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <motion.div className={`flex flex-col items-center ${cardBg} rounded-2xl shadow-lg px-6 py-8 hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.05, y: -5 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-full flex items-center justify-center mb-4 shadow-lg">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#00CC00] mb-2">150+ Signs</span>
              <span className={`text-base ${secondary} text-center`}>Comprehensive sign library</span>
            </motion.div>
            <motion.div className={`flex flex-col items-center ${cardBg} rounded-2xl shadow-lg px-6 py-8 hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.05, y: -5 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-[#4285F4] to-[#3367D6] rounded-full flex items-center justify-center mb-4 shadow-lg">
                <UsersIcon className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#4285F4] mb-2">50k+ Learners</span>
              <span className={`text-base ${secondary} text-center`}>Active community</span>
            </motion.div>
            <motion.div className={`flex flex-col items-center ${cardBg} rounded-2xl shadow-lg px-6 py-8 hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.05, y: -5 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFC107] to-[#FFA000] rounded-full flex items-center justify-center mb-4 shadow-lg">
                <TrophyIcon className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#FFC107] mb-2">20+ Badges</span>
              <span className={`text-base ${secondary} text-center`}>Gamified learning</span>
            </motion.div>
          </div>
        </motion.section>

        {/* Why Learn Sign Language Section */}
        <motion.section className="w-full max-w-6xl mx-auto px-4 mb-16" {...fadeIn(0.8)}>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Why Learn Sign Language?</h2>
            <p className={`text-lg sm:text-xl ${secondary} max-w-3xl mx-auto`}>
              Discover the profound impact of sign language on communication, inclusivity, and personal growth.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <motion.div className={`${cardBg} rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.02, y: -2 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Build Connections</h3>
              <p className={`${secondary} text-sm leading-relaxed`}>Connect with the deaf community and create meaningful relationships.</p>
            </motion.div>
            <motion.div className={`${cardBg} rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.02, y: -2 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-[#4285F4] to-[#3367D6] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <GlobeAltIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Inclusive Communication</h3>
              <p className={`${secondary} text-sm leading-relaxed`}>Make your workplace, school, and community more accessible.</p>
            </motion.div>
            <motion.div className={`${cardBg} rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.02, y: -2 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFC107] to-[#FFA000] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cognitive Benefits</h3>
              <p className={`${secondary} text-sm leading-relaxed`}>Improve memory, spatial awareness, and multitasking skills.</p>
            </motion.div>
            <motion.div className={`${cardBg} rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.02, y: -2 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#E53E3E] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Career Opportunities</h3>
              <p className={`${secondary} text-sm leading-relaxed`}>Open doors in education, healthcare, and social services.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Learning Path Section */}
        <motion.section className="w-full max-w-6xl mx-auto px-4 mb-16" {...fadeIn(1.1)}>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Your Learning Journey</h2>
            <p className={`text-lg sm:text-xl ${secondary} max-w-3xl mx-auto`}>
              Follow our structured learning path designed for beginners to advanced learners.
            </p>
          </div>
          <div className="space-y-6 lg:space-y-8">
            <motion.div className={`${cardBg} rounded-xl p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.01, y: -2 }}>
              <div className="bg-gradient-to-br from-[#00CC00] to-[#00AA00] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg">1</div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl lg:text-2xl font-semibold mb-3">Foundation Basics</h3>
                <p className={`${secondary} mb-4 text-sm lg:text-base`}>Start with essential greetings, numbers, and common phrases. Build your confidence with interactive lessons.</p>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> 2-3 weeks</span>
                  <span className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-[#00CC00]" /> 25 lessons</span>
                </div>
              </div>
            </motion.div>
            <motion.div className={`${cardBg} rounded-xl p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.01, y: -2 }}>
              <div className="bg-gradient-to-br from-[#4285F4] to-[#3367D6] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg">2</div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl lg:text-2xl font-semibold mb-3">Conversation Skills</h3>
                <p className={`${secondary} mb-4 text-sm lg:text-base`}>Learn to express emotions, ask questions, and engage in meaningful conversations.</p>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> 4-6 weeks</span>
                  <span className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-[#00CC00]" /> 40 lessons</span>
                </div>
              </div>
            </motion.div>
            <motion.div className={`${cardBg} rounded-xl p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.01, y: -2 }}>
              <div className="bg-gradient-to-br from-[#FFC107] to-[#FFA000] text-[#23272F] rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg">3</div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl lg:text-2xl font-semibold mb-3">Advanced Communication</h3>
                <p className={`${secondary} mb-4 text-sm lg:text-base`}>Master complex topics, storytelling, and professional communication skills.</p>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> 8-12 weeks</span>
                  <span className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-[#00CC00]" /> 60+ lessons</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section className="w-full max-w-6xl mx-auto px-4 mb-16" {...fadeIn(1.4)}>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">What Our Learners Say</h2>
            <p className={`text-lg sm:text-xl ${secondary} max-w-3xl mx-auto`}>
              Join thousands of satisfied learners who have transformed their communication skills.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <motion.div className={`${cardBg} rounded-xl p-6 hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.02, y: -2 }}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-full flex items-center justify-center text-white font-bold shadow-lg">S</div>
                <div className="ml-3">
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className={`text-sm ${secondary}`}>Elementary Teacher</p>
                </div>
              </div>
              <p className={`${secondary} text-sm leading-relaxed`}>"EchoAid helped me communicate better with my deaf students. The interactive lessons made learning fun and effective!"</p>
            </motion.div>
            <motion.div className={`${cardBg} rounded-xl p-6 hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.02, y: -2 }}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4285F4] to-[#3367D6] rounded-full flex items-center justify-center text-white font-bold shadow-lg">M</div>
                <div className="ml-3">
                  <h4 className="font-semibold">Mike Chen</h4>
                  <p className={`text-sm ${secondary}`}>Healthcare Worker</p>
                </div>
              </div>
              <p className={`${secondary} text-sm leading-relaxed`}>"The structured learning path and community support made all the difference. I can now assist deaf patients confidently."</p>
            </motion.div>
            <motion.div className={`${cardBg} rounded-xl p-6 hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.02, y: -2 }}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FFC107] to-[#FFA000] rounded-full flex items-center justify-center text-[#23272F] font-bold shadow-lg">E</div>
                <div className="ml-3">
                  <h4 className="font-semibold">Emma Rodriguez</h4>
                  <p className={`text-sm ${secondary}`}>Student</p>
                </div>
              </div>
              <p className={`${secondary} text-sm leading-relaxed`}>"Learning sign language opened up a whole new world of communication. The gamification keeps me motivated!"</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section className="w-full max-w-4xl mx-auto px-4 text-center" {...fadeIn(1.7)}>
          <div className={`${cardBg} rounded-2xl p-8 lg:p-12 shadow-xl`}>
            <div className="mb-6">
              <span className="inline-block bg-gradient-to-r from-[#00CC00] to-[#00AA00] text-white text-sm font-bold px-4 py-2 rounded-full mb-4 shadow-lg">
                🎉 Join 50,000+ Learners Today!
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className={`text-lg sm:text-xl ${secondary} mb-8 max-w-2xl mx-auto leading-relaxed`}>
              Join our community of learners and discover the power of inclusive communication. Start learning today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-gradient-to-r from-[#00CC00] to-[#00AA00] text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#00CC00]/50 transform hover:-translate-y-1"
              >
                🚀 Start Learning Free
              </Link>
            </div>
          </div>
        </motion.section>

      </main>
      <Footer />
    </div>
  );
}

export default Home;
