"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  Music2, Mail, Lock, User as UserIcon, ShieldCheck, 
  ArrowLeft, Loader2, KeyRound, Eye, EyeOff, 
  Headphones, Disc, Volume2, Play, Mic2 
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

type AuthState = "login" | "register" | "verify" | "forgot" | "reset"

export default function AuthPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState<AuthState>("login")
  const [loading, setLoading] = useState(false)

  // 3D tilt effect states
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Smooth form transitions
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])
  
  // Form values
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  
  // Track email for verification flow
  const [flowEmail, setFlowEmail] = useState("")

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [resending, setResending] = useState(false)

  // Clear states when transitioning views to prevent carry-over of stale codes or passwords
  const changeState = (newState: AuthState) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setState(newState)
      setCode("")
      setPassword("")
      setNewPassword("")
      setShowPassword(false)
      setShowNewPassword(false)
      setResending(false)
      setIsTransitioning(false)
    }, 300)
  }

  // Redirect if flowEmail is lost (e.g., page reload or manual URL access)
  useEffect(() => {
    if (state === "reset" && !flowEmail) {
      changeState("forgot")
    } else if (state === "verify" && !flowEmail) {
      changeState("login")
    }
  }, [state, flowEmail])

  // Mouse tilt handlers for desktop 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return // Disable on touch/mobile screens

    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    
    // Mouse coordinates relative to card top-left corner
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setCoords({ x, y })
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8 // Tilt max 8 degrees on X
    const rotateY = ((x - centerX) / centerX) * 8 // Tilt max 8 degrees on Y
    
    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
  }

  const handleResendOtp = async () => {
    if (!flowEmail) {
      toast.error("No hay un correo electrónico registrado para el envío.")
      return
    }

    setResending(true)
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: flowEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Error al reenviar el código.")
        return
      }

      toast.success(data.message || "Código reenviado con éxito.")
    } catch (err) {
      toast.error("Error de conexión al reenviar el código.")
    } finally {
      setResending(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Por favor completa todos los campos.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.requiresVerification) {
          toast.warning(data.error)
          setFlowEmail(data.email)
          changeState("verify")
        } else {
          toast.error(data.error || "Error al iniciar sesión.")
        }
        return
      }

      if (data.token) {
        localStorage.setItem("eumora_session_token", data.token)
      }
      toast.success("¡Bienvenido de vuelta a Eumora Music!")
      router.push("/")
      router.refresh()
    } catch (err) {
      toast.error("Error de conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !email || !password) {
      toast.error("Por favor completa todos los campos.")
      return
    }

    if (username.length < 3) {
      toast.error("El nombre de usuario debe tener al menos 3 caracteres.")
      return
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Error al registrarse.")
        return
      }

      toast.success(data.message)
      setFlowEmail(email)
      changeState("verify")
    } catch (err) {
      toast.error("Error de conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length !== 6) {
      toast.error("Por favor ingresa el código de 6 dígitos.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: flowEmail, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Código incorrecto o expirado.")
        return
      }

      if (data.token) {
        localStorage.setItem("eumora_session_token", data.token)
      }
      toast.success(data.message)
      router.push("/")
      router.refresh()
    } catch (err) {
      toast.error("Error de conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Error al enviar código.")
        return
      }

      toast.success(data.message)
      setFlowEmail(email)
      changeState("reset")
    } catch (err) {
      toast.error("Error de conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length !== 6 || !newPassword) {
      toast.error("Por favor completa todos los campos correctamente.")
      return
    }

    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: flowEmail, code, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Error al restablecer la contraseña.")
        return
      }

      if (data.token) {
        localStorage.setItem("eumora_session_token", data.token)
      }
      toast.success(data.message)
      router.push("/")
      router.refresh()
    } catch (err) {
      toast.error("Error de conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#070708] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#1db954]" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070708] bg-mesh px-4 text-white">
      
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-[#1db954]/10 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50vw] w-[50vw] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none animate-pulse duration-[10000ms]" />

      {/* Floating 3D Music Icons in background */}
      <Music2 className="absolute top-12 left-[10%] h-8 w-8 text-white/5 animate-float-slow pointer-events-none" />
      <Headphones className="absolute bottom-24 left-[15%] h-10 w-10 text-white/5 animate-float-reverse pointer-events-none" />
      <Disc className="absolute top-20 right-[15%] h-12 w-12 text-white/5 animate-float-reverse animate-spin-slow pointer-events-none" />
      <Volume2 className="absolute bottom-16 right-[12%] h-8 w-8 text-white/5 animate-float-slow pointer-events-none" />
      <Mic2 className="absolute top-[45%] left-[8%] h-7 w-7 text-white/5 animate-float-reverse pointer-events-none" />
      <Play className="absolute bottom-[45%] right-[8%] h-6 w-6 text-white/5 animate-float-slow pointer-events-none" />

      {/* Main Container */}
      <div className="z-10 w-full max-w-[450px] transition-all duration-300">
        
        {/* Interactive 3D Card */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: isHovered 
              ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)` 
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: isHovered ? 'transform 0.05s ease-out' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
            transformStyle: 'preserve-3d',
          }}
          className="relative rounded-2xl border border-white/10 bg-[#0f0f12]/65 p-8 backdrop-blur-2xl shadow-[0_0_50px_-10px_rgba(29,185,84,0.15)] overflow-hidden"
        >
          {/* Glare spotlight reflection layer */}
          {isHovered && (
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl z-30"
              style={{
                background: `radial-gradient(circle 250px at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.08), transparent 80%)`,
                mixBlendMode: 'overlay',
              }}
            />
          )}

          {/* Form Header (Includes Logo & Animated text subtitle) */}
          <div className="flex flex-col items-center gap-3 mb-8" style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#1db954] to-[#1ed760] shadow-[0_0_20px_rgba(29,185,84,0.35)] animate-float-slow">
              <Music2 className="h-6 w-6 text-black" fill="currentColor" />
            </div>
            
            <h1 className="text-2xl font-extrabold tracking-tight text-white select-none">
              Eumora <span className="text-[#1db954]">Music</span>
            </h1>

            <div 
              className={cn(
                "transition-all duration-300 w-full text-center text-xs text-neutral-400 font-medium leading-relaxed px-4",
                isTransitioning ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"
              )}
            >
              {state === "login" && "Inicia sesión para escuchar millones de canciones libres"}
              {state === "register" && "Crea tu cuenta gratuita para comenzar tu experiencia"}
              {state === "verify" && `Ingresa el código OTP enviado a ${flowEmail}`}
              {state === "forgot" && "Recupera el acceso a tu biblioteca de música"}
              {state === "reset" && `Ingresa el código de recuperación enviado a ${flowEmail}`}
            </div>
          </div>

          {/* Dynamic transition container for the forms */}
          <div 
            style={{ transform: 'preserve-3d', transformStyle: 'preserve-3d' }}
            className={cn(
              "transition-all duration-300 transform-gpu ease-out",
              isTransitioning ? "opacity-0 scale-95 translate-y-4 blur-sm" : "opacity-100 scale-100 translate-y-0 blur-0"
            )}
          >
            {/* LOGIN VIEW */}
            {state === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-5" style={{ transformStyle: 'preserve-3d' }}>
                <div className="flex flex-col gap-2" style={{ transform: 'translateZ(20px)' }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Correo Electrónico</label>
                  <div className="relative group">
                    <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-colors duration-300 group-focus-within:text-[#1db954]" />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-black/45 py-3.5 pr-4 pl-11 text-sm text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-[#1db954] focus:bg-black/60 focus:ring-2 focus:ring-[#1db954]/20 focus:shadow-[0_0_15px_rgba(29,185,84,0.1)]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2" style={{ transform: 'translateZ(20px)' }}>
                  <div className="flex justify-between items-center select-none">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => changeState("forgot")}
                      className="text-[11px] font-semibold text-[#1db954] hover:text-[#1ed760] transition-colors duration-200"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-colors duration-300 group-focus-within:text-[#1db954]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-black/45 py-3.5 pr-11 pl-11 text-sm text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-[#1db954] focus:bg-black/60 focus:ring-2 focus:ring-[#1db954]/20 focus:shadow-[0_0_15px_rgba(29,185,84,0.1)]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ transform: 'translateZ(30px)' }}
                  className="mt-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#1db954] to-[#1ed760] py-4 text-sm font-extrabold text-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(29,185,84,0.45)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Iniciar Sesión"}
                </button>

                <div className="mt-2 text-center text-xs text-neutral-400 select-none" style={{ transform: 'translateZ(15px)' }}>
                  ¿No tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => changeState("register")}
                    className="font-bold text-white hover:text-[#1db954] hover:underline transition-colors"
                  >
                    Regístrate gratis
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER VIEW */}
            {state === "register" && (
              <form onSubmit={handleRegister} className="flex flex-col gap-5" style={{ transformStyle: 'preserve-3d' }}>
                <div className="flex flex-col gap-2" style={{ transform: 'translateZ(20px)' }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Nombre de Usuario</label>
                  <div className="relative group">
                    <UserIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-colors duration-300 group-focus-within:text-[#1db954]" />
                    <input
                      type="text"
                      placeholder="Tu nombre o apodo"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-black/45 py-3.5 pr-4 pl-11 text-sm text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-[#1db954] focus:bg-black/60 focus:ring-2 focus:ring-[#1db954]/20 focus:shadow-[0_0_15px_rgba(29,185,84,0.1)]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2" style={{ transform: 'translateZ(20px)' }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Correo Electrónico</label>
                  <div className="relative group">
                    <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-colors duration-300 group-focus-within:text-[#1db954]" />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-black/45 py-3.5 pr-4 pl-11 text-sm text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-[#1db954] focus:bg-black/60 focus:ring-2 focus:ring-[#1db954]/20 focus:shadow-[0_0_15px_rgba(29,185,84,0.1)]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2" style={{ transform: 'translateZ(20px)' }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-colors duration-300 group-focus-within:text-[#1db954]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-black/45 py-3.5 pr-11 pl-11 text-sm text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-[#1db954] focus:bg-black/60 focus:ring-2 focus:ring-[#1db954]/20 focus:shadow-[0_0_15px_rgba(29,185,84,0.1)]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ transform: 'translateZ(30px)' }}
                  className="mt-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#1db954] to-[#1ed760] py-4 text-sm font-extrabold text-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(29,185,84,0.45)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear Cuenta"}
                </button>

                <div className="mt-2 text-center text-xs text-neutral-400 select-none" style={{ transform: 'translateZ(15px)' }}>
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => changeState("login")}
                    className="font-bold text-white hover:text-[#1db954] hover:underline transition-colors"
                  >
                    Inicia sesión
                  </button>
                </div>
              </form>
            )}

            {/* VERIFY OTP VIEW */}
            {state === "verify" && (
              <form onSubmit={handleVerify} className="flex flex-col gap-5" style={{ transformStyle: 'preserve-3d' }}>
                <button
                  type="button"
                  onClick={() => changeState("register")}
                  style={{ transform: 'translateZ(15px)' }}
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer self-start"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver al registro
                </button>

                <div className="flex flex-col gap-2" style={{ transform: 'translateZ(20px)' }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Código de Verificación</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-colors duration-300 group-focus-within:text-[#1db954]" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="••••••"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full tracking-[12px] text-center font-mono rounded-xl border border-white/5 bg-black/45 py-4 text-xl font-bold text-[#1db954] placeholder-neutral-700 outline-none transition-all duration-300 focus:border-[#1db954] focus:bg-black/60 focus:ring-2 focus:ring-[#1db954]/20 focus:shadow-[0_0_15px_rgba(29,185,84,0.15)]"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-normal select-none" style={{ transform: 'translateZ(10px)' }}>
                    Revisa tu bandeja de entrada o spam. Si SMTP no está configurado, el código aparecerá en la consola del servidor.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ transform: 'translateZ(30px)' }}
                  className="mt-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#1db954] to-[#1ed760] py-4 text-sm font-extrabold text-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(29,185,84,0.45)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verificar e Ingresar"}
                </button>

                <div className="mt-2 text-center text-xs text-neutral-400 select-none" style={{ transform: 'translateZ(15px)' }}>
                  ¿No recibiste el código?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending || loading}
                    className="font-bold text-white hover:text-[#1db954] hover:underline disabled:opacity-50 transition-colors"
                  >
                    {resending ? "Reenviando..." : "Reenviar código"}
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {state === "forgot" && (
              <form onSubmit={handleForgot} className="flex flex-col gap-5" style={{ transformStyle: 'preserve-3d' }}>
                <button
                  type="button"
                  onClick={() => changeState("login")}
                  style={{ transform: 'translateZ(15px)' }}
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer self-start"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
                </button>

                <div className="flex flex-col gap-2" style={{ transform: 'translateZ(20px)' }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Correo Electrónico</label>
                  <div className="relative group">
                    <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-colors duration-300 group-focus-within:text-[#1db954]" />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-black/45 py-3.5 pr-4 pl-11 text-sm text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-[#1db954] focus:bg-black/60 focus:ring-2 focus:ring-[#1db954]/20 focus:shadow-[0_0_15px_rgba(29,185,84,0.1)]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ transform: 'translateZ(30px)' }}
                  className="mt-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#1db954] to-[#1ed760] py-4 text-sm font-extrabold text-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(29,185,84,0.45)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar Código de Recuperación"}
                </button>
              </form>
            )}

            {/* RESET PASSWORD VIEW */}
            {state === "reset" && (
              <form onSubmit={handleReset} className="flex flex-col gap-5" style={{ transformStyle: 'preserve-3d' }}>
                <button
                  type="button"
                  onClick={() => changeState("forgot")}
                  style={{ transform: 'translateZ(15px)' }}
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer self-start"
                >
                  <ArrowLeft className="h-4 w-4" /> Cambiar correo
                </button>

                <div className="flex flex-col gap-2" style={{ transform: 'translateZ(20px)' }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Código de 6 dígitos</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-colors duration-300 group-focus-within:text-[#1db954]" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="••••••"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full tracking-[8px] text-center font-mono rounded-xl border border-white/5 bg-black/45 py-3.5 pr-4 pl-11 text-sm text-[#1db954] placeholder-neutral-700 outline-none transition-all duration-300 focus:border-[#1db954] focus:bg-black/60 focus:ring-2 focus:ring-[#1db954]/20 focus:shadow-[0_0_15px_rgba(29,185,84,0.15)]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2" style={{ transform: 'translateZ(20px)' }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Nueva Contraseña</label>
                  <div className="relative group">
                    <KeyRound className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-colors duration-300 group-focus-within:text-[#1db954]" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-black/45 py-3.5 pr-11 pl-11 text-sm text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-[#1db954] focus:bg-black/60 focus:ring-2 focus:ring-[#1db954]/20 focus:shadow-[0_0_15px_rgba(29,185,84,0.1)]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors duration-200"
                    >
                      {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ transform: 'translateZ(30px)' }}
                  className="mt-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#1db954] to-[#1ed760] py-4 text-sm font-extrabold text-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(29,185,84,0.45)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Restablecer e Iniciar Sesión"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
