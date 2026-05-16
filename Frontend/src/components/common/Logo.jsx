// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const AnimatedGameHubLogo = () => (
  <motion.div
    className="text-center font-['Arial_Black'] select-none cursor-pointer"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-red-500 blur-md opacity-20 animate-pulse" />
      
      {/* Main Text */}
      <motion.span
        className="text-xl md:text-3xl font-black tracking-normal text-red-500 relative z-10 drop-shadow-[1px_1px_0_#000]"
        animate={{ textShadow: ["1px 1px 0 #000", "1px 1px 6px #ff0000", "1px 1px 0 #000"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        GAMEHUB
      </motion.span>
      
      {/* 3D Shadow */}
      <span className="text-xl md:text-3xl font-black tracking-normal text-red-900 absolute top-0.5 left-0.5 z-0 opacity-80">
        GAMEHUB
      </span>
    </motion.div>

    {/* Animated Subtitle */}
    <motion.div
      className="text-xs font-bold tracking-[0.2em] text-green-400 uppercase mt-1 drop-shadow-[0.5px_0.5px_0_#000]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      HIGH VELOCITY
    </motion.div>

    {/* Moving Speed Lines */}
    <div className="relative h-1 mt-1 overflow-hidden">
      <motion.div
        className="absolute h-0.5 bg-linear-to-r from-transparent via-green-400 to-transparent w-full"
        animate={{ x: [-100, 100] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  </motion.div>
);

export default AnimatedGameHubLogo;