import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { StarIcon, UsersIcon, TrophyIcon, AcademicCapIcon, HeartIcon, GlobeAltIcon, ClockIcon, ChartBarIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/Navbar';
import HeroImage from '../components/HeroImage';
import { useTheme } from '../hooks/useTheme';
import Footer from '../components/Footer';

function Home() {
  const { darkMode } = useTheme();
  const bg = darkMode ? 'bg-[#23272F]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-[#F8F9FA]';
  const secondary = darkMode ? 'text-[#B2B2B2]' : 'text-[#666666]';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { delay, duration: 0.8, ease: 'easeOut' } },
  });

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col ${bg} ${text} font-sans transition-all duration-500`} style={{ fontFamily: 'Lato, sans-serif' }}>
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet" />
        <title>EchoAid | Learn Sign Language - Free, Fun & Effective</title>
        <meta name="description" content="Master sign language with EchoAid's interactive lessons, gamified learning, and supportive community. Start your journey today!" />
      </Helmet>
      
      <Navbar />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute -top-40 -left-40 w-80 h-80 bg-[#00CC00]/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#4285F4]/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="inline-flex items-center bg-gradient-to-r from-[#00CC00] to-[#00AA00] text-white text-sm font-bold px-6 py-3 rounded-full mb-8 shadow-lg"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                🎯 #1 Sign Language Learning Platform
                <SparklesIcon className="w-4 h-4 ml-2" />
              </motion.div>
              
              <motion.h1 
                className="font-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-8 text-[#00CC00] drop-shadow-[0_4px_12px_rgba(0,204,0,0.3)]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                The free, fun, and
                <br />
                <span className="bg-gradient-to-r from-[#00CC00] to-[#00AA00] bg-clip-text text-transparent">
                  effective way
                </span>
                <br />
                to learn sign language!
              </motion.h1>
              
              <motion.p 
                className={`text-xl sm:text-2xl lg:text-3xl font-light mb-12 ${secondary} max-w-4xl mx-auto leading-relaxed`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Master signs through interactive lessons, earn badges, and join a deaf-friendly community with EchoAid.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <Link
                  to="/signup"
                  className="group bg-gradient-to-r from-[#00CC00] to-[#00AA00] text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#00CC00]/50 transform hover:-translate-y-2"
                  aria-label="Get Started"
                >
                  <span className="flex items-center justify-center">
                    🚀 Get Started Free
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </span>
                </Link>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-[#00CC00]" />
                    <span className={secondary}>50,000+ learners</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-[#00CC00]" />
                    <span className={secondary}>150+ signs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-[#00CC00]" />
                    <span className={secondary}>Free forever</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 1.2, ease: 'easeOut' }}
              className="flex justify-center"
            >
              <HeroImage className="w-full max-w-4xl" />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              {...fadeIn(0.2)}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Why Choose EchoAid?</h2>
              <p className={`text-xl sm:text-2xl ${secondary} max-w-3xl mx-auto leading-relaxed`}>
                Join thousands of learners who have transformed their communication skills
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div 
                className={`${cardBg} rounded-3xl p-8 lg:p-10 hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-105`}
                variants={fadeIn(0.3)}
                whileHover={{ y: -10 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <StarIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#00CC00] mb-4">150+ Signs</h3>
                <p className={`text-lg ${secondary} leading-relaxed`}>Comprehensive sign library with interactive lessons and real-world examples.</p>
              </motion.div>
              
              <motion.div 
                className={`${cardBg} rounded-3xl p-8 lg:p-10 hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-105`}
                variants={fadeIn(0.4)}
                whileHover={{ y: -10 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#4285F4] to-[#3367D6] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <UsersIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#4285F4] mb-4">50k+ Learners</h3>
                <p className={`text-lg ${secondary} leading-relaxed`}>Active community of learners supporting each other's journey.</p>
              </motion.div>
              
              <motion.div 
                className={`${cardBg} rounded-3xl p-8 lg:p-10 hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-105`}
                variants={fadeIn(0.5)}
                whileHover={{ y: -10 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#FFC107] to-[#FFA000] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <TrophyIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#FFC107] mb-4">20+ Badges</h3>
                <p className={`text-lg ${secondary} leading-relaxed`}>Gamified learning with achievements and progress tracking.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Why Learn Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#00CC00]/5 to-[#4285F4]/5">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              {...fadeIn(0.2)}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Why Learn Sign Language?</h2>
              <p className={`text-xl sm:text-2xl ${secondary} max-w-4xl mx-auto leading-relaxed`}>
                Discover the profound impact of sign language on communication, inclusivity, and personal growth.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div 
                className={`${cardBg} rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-105`}
                variants={fadeIn(0.3)}
                whileHover={{ y: -8 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <HeartIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Build Connections</h3>
                <p className={`${secondary} leading-relaxed`}>Connect with the deaf community and create meaningful relationships.</p>
              </motion.div>
              
              <motion.div 
                className={`${cardBg} rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-105`}
                variants={fadeIn(0.4)}
                whileHover={{ y: -8 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#4285F4] to-[#3367D6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <GlobeAltIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Inclusive Communication</h3>
                <p className={`${secondary} leading-relaxed`}>Make your workplace, school, and community more accessible.</p>
              </motion.div>
              
              <motion.div 
                className={`${cardBg} rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-105`}
                variants={fadeIn(0.5)}
                whileHover={{ y: -8 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFC107] to-[#FFA000] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <AcademicCapIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Cognitive Benefits</h3>
                <p className={`${secondary} leading-relaxed`}>Improve memory, spatial awareness, and multitasking skills.</p>
              </motion.div>
              
              <motion.div 
                className={`${cardBg} rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-105`}
                variants={fadeIn(0.6)}
                whileHover={{ y: -8 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#E53E3E] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Career Opportunities</h3>
                <p className={`${secondary} leading-relaxed`}>Open doors in education, healthcare, and social services.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Learning Path Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              {...fadeIn(0.2)}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Your Learning Journey</h2>
              <p className={`text-xl sm:text-2xl ${secondary} max-w-4xl mx-auto leading-relaxed`}>
                Follow our structured learning path designed for beginners to advanced learners.
              </p>
            </motion.div>
            
            <motion.div 
              className="space-y-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div 
                className={`${cardBg} rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-102`}
                variants={fadeIn(0.3)}
                whileHover={{ y: -5 }}
              >
                <div className="bg-gradient-to-br from-[#00CC00] to-[#00AA00] text-white rounded-2xl w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-xl">1</div>
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4">Foundation Basics</h3>
                  <p className={`${secondary} mb-6 text-lg leading-relaxed`}>Start with essential greetings, numbers, and common phrases. Build your confidence with interactive lessons.</p>
                  <div className="flex flex-col sm:flex-row items-center gap-6 text-base">
                    <span className="flex items-center gap-2"><ClockIcon className="w-5 h-5" /> 2-3 weeks</span>
                    <span className="flex items-center gap-2"><StarIcon className="w-5 h-5 text-[#00CC00]" /> 25 lessons</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className={`${cardBg} rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-102`}
                variants={fadeIn(0.4)}
                whileHover={{ y: -5 }}
              >
                <div className="bg-gradient-to-br from-[#4285F4] to-[#3367D6] text-white rounded-2xl w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-xl">2</div>
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4">Conversation Skills</h3>
                  <p className={`${secondary} mb-6 text-lg leading-relaxed`}>Learn to express emotions, ask questions, and engage in meaningful conversations.</p>
                  <div className="flex flex-col sm:flex-row items-center gap-6 text-base">
                    <span className="flex items-center gap-2"><ClockIcon className="w-5 h-5" /> 4-6 weeks</span>
                    <span className="flex items-center gap-2"><StarIcon className="w-5 h-5 text-[#00CC00]" /> 40 lessons</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className={`${cardBg} rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-102`}
                variants={fadeIn(0.5)}
                whileHover={{ y: -5 }}
              >
                <div className="bg-gradient-to-br from-[#FFC107] to-[#FFA000] text-[#23272F] rounded-2xl w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-xl">3</div>
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4">Advanced Communication</h3>
                  <p className={`${secondary} mb-6 text-lg leading-relaxed`}>Master complex topics, storytelling, and professional communication skills.</p>
                  <div className="flex flex-col sm:flex-row items-center gap-6 text-base">
                    <span className="flex items-center gap-2"><ClockIcon className="w-5 h-5" /> 8-12 weeks</span>
                    <span className="flex items-center gap-2"><StarIcon className="w-5 h-5 text-[#00CC00]" /> 60+ lessons</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#4285F4]/5 to-[#00CC00]/5">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              {...fadeIn(0.2)}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">What Our Learners Say</h2>
              <p className={`text-xl sm:text-2xl ${secondary} max-w-4xl mx-auto leading-relaxed`}>
                Join thousands of satisfied learners who have transformed their communication skills.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div 
                className={`${cardBg} rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-105`}
                variants={fadeIn(0.3)}
                whileHover={{ y: -8 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">S</div>
                  <div className="ml-4">
                    <h4 className="font-bold text-lg">Sarah Johnson</h4>
                    <p className={`text-sm ${secondary}`}>Elementary Teacher</p>
                  </div>
                </div>
                <p className={`${secondary} text-base leading-relaxed`}>"EchoAid helped me communicate better with my deaf students. The interactive lessons made learning fun and effective!"</p>
              </motion.div>
              
              <motion.div 
                className={`${cardBg} rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-105`}
                variants={fadeIn(0.4)}
                whileHover={{ y: -8 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#4285F4] to-[#3367D6] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">M</div>
                  <div className="ml-4">
                    <h4 className="font-bold text-lg">Mike Chen</h4>
                    <p className={`text-sm ${secondary}`}>Healthcare Worker</p>
                  </div>
                </div>
                <p className={`${secondary} text-base leading-relaxed`}>"The structured learning path and community support made all the difference. I can now assist deaf patients confidently."</p>
              </motion.div>
              
              <motion.div 
                className={`${cardBg} rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 border ${border} hover:scale-105`}
                variants={fadeIn(0.5)}
                whileHover={{ y: -8 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FFC107] to-[#FFA000] rounded-2xl flex items-center justify-center text-[#23272F] font-bold text-xl shadow-lg">E</div>
                  <div className="ml-4">
                    <h4 className="font-bold text-lg">Emma Rodriguez</h4>
                    <p className={`text-sm ${secondary}`}>Student</p>
                  </div>
                </div>
                <p className={`${secondary} text-base leading-relaxed`}>"Learning sign language opened up a whole new world of communication. The gamification keeps me motivated!"</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className={`${cardBg} rounded-3xl p-12 lg:p-16 shadow-2xl border ${border} text-center`}
              {...fadeIn(0.2)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="inline-flex items-center bg-gradient-to-r from-[#00CC00] to-[#00AA00] text-white text-lg font-bold px-8 py-4 rounded-full mb-8 shadow-lg"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                🎉 Join 50,000+ Learners Today!
                <SparklesIcon className="w-5 h-5 ml-2" />
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">Ready to Start Your Journey?</h2>
              <p className={`text-xl sm:text-2xl ${secondary} mb-12 max-w-3xl mx-auto leading-relaxed`}>
                Join our community of learners and discover the power of inclusive communication. Start learning today!
              </p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Link
                  to="/signup"
                  className="group bg-gradient-to-r from-[#00CC00] to-[#00AA00] text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#00CC00]/50 transform hover:-translate-y-2"
                >
                  <span className="flex items-center justify-center">
                    🚀 Start Learning Free
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export default Home;
