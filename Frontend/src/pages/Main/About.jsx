import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  FaGamepad, 
  FaShippingFast, 
  FaHeadset, 
  FaShieldAlt,
  FaUsers,
  FaStar,
  FaTrophy,
  FaAward,
  FaRocket,
  FaChartLine,
  FaGlobeAmericas,
  FaFire,
  FaPlay,
  FaCheckCircle,
  FaBolt,
  FaHeart,
  FaCrown
} from 'react-icons/fa';
import { BaseUrl, normalizeGame } from '../../Services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut"
    }
  }
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      type: "spring",
      stiffness: 100
    }
  })
};

const About = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!BaseUrl) {
      setLoading(false);
      return;
    }

    const fetchGames = async () => {
      try {
        const response = await fetch(`${BaseUrl}/games?pageSize=6`);
        if (response.ok) {
          const payload = await response.json();
          const items = payload?.data?.items || payload?.items || payload || [];
          setFeaturedGames(items.slice(0, 6).map(normalizeGame).filter(Boolean));
        }
      } catch (err) {
        console.debug("Failed to fetch games:", err);
      }
      setLoading(false);
    };

    fetchGames();
  }, []);

  const stats = [
    { number: "50K+", label: "Happy Gamers", icon: <FaUsers className="text-2xl" /> },
    { number: "5K+", label: "Games Available", icon: <FaGamepad className="text-2xl" /> },
    { number: "24/7", label: "Customer Support", icon: <FaHeadset className="text-2xl" /> },
    { number: "99.9%", label: "Uptime", icon: <FaShieldAlt className="text-2xl" /> }
  ];

  const values = [
    {
      icon: <FaStar className="text-2xl" />,
      title: "Quality First",
      description: "We curate only the best games and ensure top-notch quality in everything we do."
    },
    {
      icon: <FaShippingFast className="text-2xl" />,
      title: "Instant Delivery",
      description: "Get your games instantly with our digital delivery system. No waiting, just playing."
    },
    {
      icon: <FaHeadset className="text-2xl" />,
      title: "24/7 Support",
      description: "Our gaming experts are available round the clock to help you with any issues."
    },
    {
      icon: <FaTrophy className="text-2xl" />,
      title: "Gamer Focused",
      description: "Everything we do is centered around providing the best experience for gamers."
    }
  ];

  const milestones = [
    { year: "2020", event: "Founded", icon: <FaRocket className="text-red-400" /> },
    { year: "2021", event: "10K Users", icon: <FaUsers className="text-red-400" /> },
    { year: "2022", event: "Global Expansion", icon: <FaGlobeAmericas className="text-red-400" /> },
    { year: "2023", event: "50K Users", icon: <FaFire className="text-red-400" /> },
    { year: "2024", event: "5K+ Games", icon: <FaGamepad className="text-red-400" /> }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO SECTION - Bold Asymmetric Design */}
      <section className="relative bg-black overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 border-2 border-red-600 rounded-full" />
          <div className="absolute bottom-20 right-10 w-96 h-96 border-2 border-red-600 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-red-600/20" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left - Animated Text Content */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4">
                  <span className="block bg-linear-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent">
                    ABOUT
                  </span>
                  <span className="block text-white mt-2">GAMEHUB</span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed">
                  Your ultimate destination for gaming. We're passionate about bringing the best gaming 
                  experiences to players worldwide with instant delivery and unbeatable prices.
                </p>
              </motion.div>
              
<motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-wrap gap-6"
          >
            {[FaBolt, FaHeart, FaTrophy, FaCrown].map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1, y: -3 }}
                className="flex items-center space-x-3 text-gray-300 cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                >
                  <Icon className="text-red-500 text-xl" />
                </motion.div>
                <span className="font-medium">
                  {i === 0 && "Lightning Fast"}
                  {i === 1 && "Gaming Love"}
                  {i === 2 && "Top Rated"}
                  {i === 3 && "Premium"}
                </span>
              </motion.div>
            ))}
          </motion.div>
              
              <motion.button 
                onClick={() => window.location.href = '/products'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                whileHover={{ scale: 1.05, x: 5, boxShadow: "0 0 30px rgba(220, 38, 38, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-3 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg shadow-red-900/30 group"
              >
                <FaPlay className="text-sm group-hover:translate-x-1 transition-transform" />
                <span>Explore Games</span>
              </motion.button>
            </div>
            
            {/* Right - Game Images Grid from Backend */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="lg:col-span-5 grid grid-cols-2 gap-4"
            >
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-900 rounded-3xl border border-gray-800 animate-pulse" />
                ))
              ) : featuredGames.length > 0 ? (
                featuredGames.slice(0, 4).map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, rotate: -180, scale: 0 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8, type: "spring" }}
                    className="aspect-square rounded-3xl overflow-hidden border border-gray-800 shadow-xl group"
                  >
                    <img
                      src={game.images?.[0] || "/images/placeholder-game.jpg"}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { e.target.src = "/images/placeholder-game.jpg" }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                ))
              ) : (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-900 rounded-3xl border border-gray-800 flex items-center justify-center">
                    <FaGamepad className="text-4xl text-red-600/50" />
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* OUR STORY - Dynamic Split Screen */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Background decorative elements */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              {/* Left - Stylized Game Images */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-6 relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20 border border-gray-800">
                  {featuredGames[0]?.images?.[0] ? (
                    <img
                      src={featuredGames[0].images[0]}
                      alt={featuredGames[0].name}
                      className="w-full h-80 md:h-96 object-cover"
                      onError={(e) => { e.target.src = "/images/placeholder-game.jpg" }}
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                      alt="Gaming Setup"
                      className="w-full h-80 md:h-96 object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaGamepad className="text-red-500 text-xl" />
                      <span className="text-white font-bold text-lg">Premium Gaming</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="px-3 py-1 bg-red-600 rounded-full text-xs font-semibold">Instant Delivery</div>
                      <div className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold">Official Keys</div>
                    </div>
                  </div>
                </div>
                {/* Floating game cards */}
                {featuredGames.slice(1, 3).map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.2 }}
                    className="absolute -bottom-10 right-0 lg:-right-16 w-32 h-40 rounded-2xl overflow-hidden border-2 border-red-600 shadow-lg"
                  >
                    <img
                      src={game.images?.[0] || "/images/placeholder-game.jpg"}
                      alt={game.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "/images/placeholder-game.jpg" }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Right - Story Content */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-6"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <FaRocket className="text-red-500 text-3xl" />
                  <h2 className="text-4xl md:text-5xl font-bold text-white">Our Story</h2>
                </div>
                
                <div className="space-y-6 mb-8">
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-gray-300 leading-relaxed border-l-4 border-red-600 pl-6"
                  >
                    Founded in 2020, GameHub started as a small passion project by gaming enthusiasts 
                    who believed every gamer deserves instant access to their favorite titles at affordable prices.
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-gray-300 leading-relaxed border-l-4 border-red-600 pl-6"
                  >
                    What began as an idea has grown into a trusted platform serving thousands of gamers 
                    worldwide, partnering with major publishers and indie developers alike.
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-gray-300 leading-relaxed border-l-4 border-red-600 pl-6"
                  >
                    Today, we continue to innovate, keeping our community at the heart of everything we do.
                  </motion.p>
                </div>
                
                {/* Features */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  {[
                    { icon: FaCheckCircle, text: "Instant Delivery" },
                    { icon: FaCheckCircle, text: "Official Keys" },
                    { icon: FaCheckCircle, text: "24/7 Support" }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -3 }}
                      className="flex items-center space-x-3 bg-gray-900 rounded-xl p-4 border border-gray-800"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      >
                        <item.icon className="text-red-500 text-xl flex-shrink-0" />
                      </motion.div>
                      <span className="text-gray-300 font-medium text-sm">{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 py-24 border-t border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">By The Numbers</h2>
            <p className="text-lg text-gray-400">Our impact in the gaming community</p>
          </motion.div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={statVariants}
                custom={index}
                whileHover={{ scale: 1.08, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-red-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500" />
                <div className="relative bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 group-hover:border-red-600 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/10 rounded-full -translate-y-10 translate-x-10 group-hover:bg-red-600/20 transition-all duration-300" />
                  <div className="relative">
                    <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600/30 transition-all duration-300">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                        className="text-red-500 group-hover:text-white transition-colors duration-300"
                      >
                        {stat.icon}
                      </motion.div>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-gray-400 font-medium">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-lg text-gray-400">What drives us every day</p>
          </motion.div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-gray-900 rounded-2xl p-8 text-center border border-gray-800 hover:bg-gray-800 transition-all duration-300"
              >
<div className="relative w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-700 transition-all duration-300">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                        className="text-white"
                      >
                        {value.icon}
                      </motion.div>
                      <div className="absolute inset-0 rounded-xl border-2 border-red-600/30 group-hover:border-red-400/50 transition-all duration-300" />
                    </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Milestones Timeline - Professional Clean Design */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Journey</h2>
            <p className="text-lg text-gray-400">Milestones we've achieved since 2020</p>
          </motion.div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-red-600 transform md:-translate-x-0.5" />
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              {milestones.map((milestone, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className={`relative flex items-start md:items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} md:justify-center`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-red-600 rounded-full transform -translate-x-1/2 md:-translate-x-1/2 flex items-center justify-center z-10 shadow-lg shadow-red-900/50">
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      className="w-3 h-3 bg-white rounded-full"
                    />
                  </div>
                  
                  {/* Content card */}
                  <div className={`ml-16 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                    <div className="group bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:bg-gray-750 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-red-600/20 rounded-lg group-hover:bg-red-600/30 transition-colors duration-300">
                          {milestone.icon}
                        </div>
                        <span className="text-2xl font-bold text-red-400">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{milestone.event}</h3>
                      <p className="text-gray-400 text-sm">
                        {milestone.event === 'Founded' && 'Started as a passion project by gaming enthusiasts'}
                        {milestone.event === '10K Users' && 'Reached our first major user milestone'}
                        {milestone.event === 'Global Expansion' && 'Expanded our reach to international markets'}
                        {milestone.event === '50K Users' && 'Community grew to 50K+ active users'}
                        {milestone.event === '5K+ Games' && 'Curated library of 5000+ premium games'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-linear-to-r from-red-700 to-red-900 text-white py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <FaAward className="text-5xl mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
              To revolutionize the way gamers access and enjoy their favorite titles by providing 
              instant, affordable, and reliable gaming experiences to players around the world.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Accessibility', 'Innovation', 'Community'].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-black/50 transition-all duration-300"
                >
                  <h3 className="text-2xl font-bold mb-3 text-red-400">{item}</h3>
                  <p className="text-gray-300 text-sm">
                    {item === 'Accessibility' && 'Making gaming accessible to everyone, everywhere'}
                    {item === 'Innovation' && 'Constantly improving and innovating for our community'}
                    {item === 'Community' && 'Building a strong, supportive gaming community'}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Level Up Your Gaming?</h2>
            <p className="text-xl mb-10 text-gray-300">
              Join thousands of satisfied gamers and discover your next favorite game today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/products'}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition duration-300 transform hover:scale-105 border border-red-600 shadow-lg shadow-red-900/30"
              >
                Browse Games
              </button>
              <button
                onClick={() => window.location.href = '/contact'}
                className="bg-transparent hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold border border-gray-600 transition duration-300 hover:border-gray-500"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;