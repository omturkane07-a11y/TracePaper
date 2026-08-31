import { motion } from "framer-motion";
import logo from "../../assets/tracepaper-logo.png";

export default function AuthLayout({ children, className = "" }) {
  return (
    <div className={`auth-page ${className} relative min-h-screen bg-[#07111f] flex overflow-hidden`}>

      {/* ================= ANIMATED BACKGROUND ================= */}

      <div className="absolute inset-0 overflow-hidden">

        {/* Blue Glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse" />

        {/* Cyan Glow */}
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        {/* Center Glow */}
        <div
          className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        {/* Security Grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating Dots */}
        <div className="absolute top-24 left-24 w-2 h-2 bg-blue-400 rounded-full animate-ping" />

        <div className="absolute top-40 right-32 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />

        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-ping" />

        <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" />

      </div>


      {/* ================= LEFT SIDE ================= */}

      <div className="relative z-10 hidden lg:flex lg:w-1/2 min-h-screen items-center justify-center">

        {/* Branding Group */}
        <div className="flex flex-col items-center text-center px-10 -translate-y-16">

          {/* LARGE LOGO */}
          <motion.img
            src={logo}
            alt="TracePaper Logo"
            initial={{
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -10, 0],
            }}
            transition={{
              opacity: {
                duration: 0.8,
              },
              scale: {
                duration: 0.8,
              },
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="w-[500px] h-[500px] object-contain drop-shadow-[0_0_55px_rgba(37,99,235,0.55)]"
          />

          {/* Brand Name */}
          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
            }}
            className="text-5xl font-bold text-white tracking-wide -mt-24"
          >
            TracePaper
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.6,
            }}
            className="text-blue-300 text-lg mt-3"
          >
            Leak Detection & Investigation
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.8,
            }}
            className="text-slate-400 text-sm mt-2 max-w-md"
          >
            Enterprise Examination Security Platform
          </motion.p>

          {/* Feature Badges */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1,
            }}
            className="flex gap-3 mt-8"
          >

            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">
              🔐 Secure
            </div>

            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">
              🔍 Trace
            </div>

            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">
              🛡 Protect
            </div>

          </motion.div>

        </div>

      </div>


      {/* ================= RIGHT SIDE ================= */}

      <div className="relative z-10 w-full lg:w-1/2 min-h-screen flex items-center justify-center px-6 py-10 overflow-y-auto">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">

            <motion.img
              src={logo}
              alt="TracePaper Logo"
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="w-28 h-28 object-contain drop-shadow-[0_0_30px_rgba(37,99,235,0.5)]"
            />

            <h1 className="text-3xl font-bold text-white mt-1">
              TracePaper
            </h1>

            <p className="text-slate-400 text-sm mt-1">
              Enterprise Examination Security Platform
            </p>

          </div>


          {/* ================= PREMIUM AUTH CARD ================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="
              relative
              rounded-3xl
              p-[1.5px]
              bg-gradient-to-br
              from-blue-400
              via-cyan-400
              to-blue-700
              shadow-[0_0_35px_rgba(37,99,235,0.25)]
            "
          >

            {/* Premium Outer Glow */}
            <div
              className="
                absolute
                -inset-1
                rounded-3xl
                bg-gradient-to-br
                from-blue-500/20
                via-cyan-400/15
                to-indigo-600/20
                blur-md
                -z-10
              "
            />

            {/* White Login/Register Card */}
            <div
              className="
                bg-white/95
                backdrop-blur-xl
                rounded-[22px]
                shadow-2xl
                p-8
                sm:p-10
              "
            >
              {children}
            </div>

          </motion.div>


          {/* Security Status */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.8,
            }}
            className="flex items-center justify-center gap-2 mt-5 text-slate-400 text-xs"
          >

            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <span>
              Secure Enterprise Environment
            </span>

          </motion.div>

        </div>

      </div>

    </div>
  );
}