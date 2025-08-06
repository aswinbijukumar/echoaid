import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { StarIcon, UsersIcon, TrophyIcon, AcademicCapIcon, HeartIcon, GlobeAltIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
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
          <motion.img
            src="/images/hello-sign.gif"
            alt="Animated hand sign for Hello"
            className="mx-auto w-64 h-64 md:w-[400px] md:h-[400px] rounded-2xl shadow-lg border-4 border-[#00CC00] bg-white object-cover"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1.1, ease: 'easeOut' }}
          />
          {/* Headline and CTA */}
          <div className="flex flex-col items-center md:items-start max-w-xl">
            <h1 className="font-black text-3xl md:text-5xl text-center md:text-left leading-tight mb-4 text-[#00CC00] drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
              The free, fun, and effective way to learn sign language!
            </h1>
            <p className={`text-lg md:text-2xl font-normal text-center md:text-left mb-8 ${secondary} max-w-lg`}>
              Master signs through interactive lessons, earn badges, and join a deaf-friendly community with EchoAid.
            </p>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center md:justify-start">
              <Link
                to="/signup"
                className="bg-[#00CC00] text-white font-bold text-lg px-10 py-3 rounded-xl shadow-lg hover:bg-[#FFC107] hover:text-[#23272F] transition-all focus:outline-none focus:ring-2 focus:ring-[#00CC00] text-center"
                aria-label="Get Started"
              >
                Get Started
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mt-4 mb-16" {...fadeIn(0.5)}>
          <motion.div className={`flex flex-col items-center ${cardBg} rounded-2xl shadow-lg px-8 py-8 w-full max-w-xs hover:scale-105 transition-transform`} whileHover={{ scale: 1.07 }}>
            <StarIcon className="w-12 h-12 text-[#00CC00] mb-2 drop-shadow-[0_2px_8px_rgba(0,204,0,0.25)]" />
            <span className="text-2xl font-bold text-[#00CC00] mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">150+ Signs</span>
            <span className={`text-base ${secondary}`}>to learn</span>
          </motion.div>
          <motion.div className={`flex flex-col items-center ${cardBg} rounded-2xl shadow-lg px-8 py-8 w-full max-w-xs hover:scale-105 transition-transform`} whileHover={{ scale: 1.07 }}>
            <UsersIcon className="w-12 h-12 text-[#4285F4] mb-2 drop-shadow-[0_2px_8px_rgba(66,133,244,0.25)]" />
            <span className="text-2xl font-bold text-[#4285F4] mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">50k+ Learners</span>
            <span className={`text-base ${secondary}`}>in our community</span>
          </motion.div>
          <motion.div className={`flex flex-col items-center ${cardBg} rounded-2xl shadow-lg px-8 py-8 w-full max-w-xs hover:scale-105 transition-transform`} whileHover={{ scale: 1.07 }}>
            <TrophyIcon className="w-12 h-12 text-[#FFC107] mb-2 drop-shadow-[0_2px_8px_rgba(255,193,7,0.25)]" />
            <span className="text-2xl font-bold text-[#FFC107] mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">20+ Badges</span>
            <span className={`text-base ${secondary}`}>to earn</span>
          </motion.div>
        </motion.section>

        {/* Why Learn Sign Language Section */}
        <motion.section className="w-full max-w-6xl mx-auto mb-12" {...fadeIn(0.8)}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Learn Sign Language?</h2>
            <p className={`text-xl ${secondary} max-w-3xl mx-auto`}>
              Discover the profound impact of sign language on communication, inclusivity, and personal growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className={`${cardBg} rounded-xl p-6 text-center hover:shadow-xl transition-shadow`}>
              <HeartIcon className="w-12 h-12 text-[#00CC00] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Build Connections</h3>
              <p className={`${secondary}`}>Connect with the deaf community and create meaningful relationships.</p>
            </div>
            <div className={`${cardBg} rounded-xl p-6 text-center hover:shadow-xl transition-shadow`}>
              <GlobeAltIcon className="w-12 h-12 text-[#4285F4] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Inclusive Communication</h3>
              <p className={`${secondary}`}>Make your workplace, school, and community more accessible.</p>
            </div>
            <div className={`${cardBg} rounded-xl p-6 text-center hover:shadow-xl transition-shadow`}>
              <AcademicCapIcon className="w-12 h-12 text-[#FFC107] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cognitive Benefits</h3>
              <p className={`${secondary}`}>Improve memory, spatial awareness, and multitasking skills.</p>
            </div>
            <div className={`${cardBg} rounded-xl p-6 text-center hover:shadow-xl transition-shadow`}>
              <ChartBarIcon className="w-12 h-12 text-[#FF6B6B] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Career Opportunities</h3>
              <p className={`${secondary}`}>Open doors in education, healthcare, and social services.</p>
            </div>
          </div>
        </motion.section>

        {/* Learning Path Section */}
        <motion.section className="w-full max-w-6xl mx-auto mb-12" {...fadeIn(1.1)}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Your Learning Journey</h2>
            <p className={`text-xl ${secondary} max-w-3xl mx-auto`}>
              Follow our structured learning path designed for beginners to advanced learners.
            </p>
          </div>
          <div className="space-y-8">
            <div className={`${cardBg} rounded-xl p-8 flex flex-col md:flex-row items-center gap-8`}>
              <div className="bg-[#00CC00] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">1</div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-2">Foundation Basics</h3>
                <p className={`${secondary} mb-4`}>Start with essential greetings, numbers, and common phrases. Build your confidence with interactive lessons.</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> 2-3 weeks</span>
                  <span className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-[#00CC00]" /> 25 lessons</span>
                </div>
              </div>
            </div>
            <div className={`${cardBg} rounded-xl p-8 flex flex-col md:flex-row items-center gap-8`}>
              <div className="bg-[#4285F4] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">2</div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-2">Conversation Skills</h3>
                <p className={`${secondary} mb-4`}>Learn to express emotions, ask questions, and engage in meaningful conversations.</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> 4-6 weeks</span>
                  <span className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-[#00CC00]" /> 40 lessons</span>
                </div>
              </div>
            </div>
            <div className={`${cardBg} rounded-xl p-8 flex flex-col md:flex-row items-center gap-8`}>
              <div className="bg-[#FFC107] text-[#23272F] rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">3</div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-2">Advanced Communication</h3>
                <p className={`${secondary} mb-4`}>Master complex topics, storytelling, and professional communication skills.</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> 8-12 weeks</span>
                  <span className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-[#00CC00]" /> 60+ lessons</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section className="w-full max-w-6xl mx-auto mb-12" {...fadeIn(1.4)}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Learners Say</h2>
            <p className={`text-xl ${secondary} max-w-3xl mx-auto`}>
              Join thousands of satisfied learners who have transformed their communication skills.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`${cardBg} rounded-xl p-6`}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#00CC00] rounded-full flex items-center justify-center text-white font-bold">S</div>
                <div className="ml-3">
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className={`text-sm ${secondary}`}>Elementary Teacher</p>
                </div>
              </div>
              <p className={`${secondary}`}>"EchoAid helped me communicate better with my deaf students. The interactive lessons made learning fun and effective!"</p>
            </div>
            <div className={`${cardBg} rounded-xl p-6`}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#4285F4] rounded-full flex items-center justify-center text-white font-bold">M</div>
                <div className="ml-3">
                  <h4 className="font-semibold">Mike Chen</h4>
                  <p className={`text-sm ${secondary}`}>Healthcare Worker</p>
                </div>
              </div>
              <p className={`${secondary}`}>"The structured learning path and community support made all the difference. I can now assist deaf patients confidently."</p>
            </div>
            <div className={`${cardBg} rounded-xl p-6`}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#FFC107] rounded-full flex items-center justify-center text-[#23272F] font-bold">E</div>
                <div className="ml-3">
                  <h4 className="font-semibold">Emma Rodriguez</h4>
                  <p className={`text-sm ${secondary}`}>Student</p>
                </div>
              </div>
              <p className={`${secondary}`}>"Learning sign language opened up a whole new world of communication. The gamification keeps me motivated!"</p>
            </div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section className="w-full max-w-4xl mx-auto text-center" {...fadeIn(1.7)}>
          <div className={`${cardBg} rounded-2xl p-12`}>
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className={`text-xl ${secondary} mb-8 max-w-2xl mx-auto`}>
              Join our community of learners and discover the power of inclusive communication. Start learning today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-[#00CC00] text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-[#FFC107] hover:text-[#23272F] transition-all focus:outline-none focus:ring-2 focus:ring-[#00CC00]"
              >
                Start Learning Free
              </Link>
              <Link
                to="/dictionary"
                className="border-2 border-[#00CC00] text-[#00CC00] font-bold text-lg px-8 py-4 rounded-xl hover:bg-[#00CC00] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#00CC00]"
              >
                Explore Dictionary
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
