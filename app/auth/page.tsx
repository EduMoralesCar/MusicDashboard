"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Mail, Lock, User as UserIcon, ShieldCheck, 
  ArrowLeft, Loader2, KeyRound, Eye, EyeOff 
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

type AuthState = "login" | "register" | "verify" | "forgot" | "reset"

const SUBTITLES = {
  login: [
    "Inicia sesión para acceder a tus playlists y biblioteca de música.",
    "Escucha a tus artistas favoritos sin anuncios y sin límites.",
    "Toda tu biblioteca personal en la nube, siempre sincronizada."
  ],
  register: [
    "Crea una cuenta gratis en segundos y siente el verdadero ritmo.",
    "Únete a una comunidad musical sin restricciones ni comerciales.",
    "Sube tus canciones favoritas y arma tus colecciones en alta calidad."
  ],
  verify: [
    "Introduce el código de 6 dígitos que te enviamos al correo.",
    "Si no configuraste el SMTP, revisa el log en la consola del servidor."
  ],
  forgot: [
    "Introduce tu correo electrónico registrado para recuperar el acceso.",
    "Te enviaremos un código de un solo uso para verificar tu cuenta."
  ],
  reset: [
    "Establece una nueva contraseña de seguridad para ingresar.",
    "Recuerda usar una combinación de letras y números para mayor seguridad."
  ]
}

export default function AuthPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const [state, setState] = useState<AuthState>("login")
  const [loading, setLoading] = useState(false)

  // Smooth form transitions
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Subtitle Carousel state
  const [subtitleIndex, setSubtitleIndex] = useState(0)
  const [fadeSubtitle, setFadeSubtitle] = useState(true)

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])
  
  // Subtitle Carousel rotation
  useEffect(() => {
    setSubtitleIndex(0)
    setFadeSubtitle(true)
  }, [state])

  useEffect(() => {
    const list = SUBTITLES[state] || SUBTITLES.login
    if (list.length <= 1) return

    const interval = setInterval(() => {
      setFadeSubtitle(false)
      setTimeout(() => {
        setSubtitleIndex((prev) => (prev + 1) % list.length)
        setFadeSubtitle(true)
      }, 250)
    }, 5000)

    return () => clearInterval(interval)
  }, [state])

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

  // Clear states when transitioning views
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
    }, 200)
  }

  // Redirect if flowEmail is lost
  useEffect(() => {
    if (state === "reset" && !flowEmail) {
      changeState("forgot")
    } else if (state === "verify" && !flowEmail) {
      changeState("login")
    }
  }, [state, flowEmail])

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
      await refreshUser()
      toast.success("¡Bienvenido de vuelta a Eumora Music!")
      router.push("/")
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
      await refreshUser()
      toast.success(data.message)
      router.push("/")
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
      await refreshUser()
      toast.success(data.message)
      router.push("/")
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
    <div className="relative flex min-h-screen w-full bg-[#070708] text-white overflow-hidden select-none">
      <div className="grid grid-cols-1 md:grid-cols-12 w-full min-h-screen">
        
        {/* Left Side: Form Column */}
        <div className="relative col-span-1 md:col-span-5 flex flex-col justify-center bg-[#0a0a0c] px-8 sm:px-16 md:px-12 lg:px-16 xl:px-24 py-12 z-20 border-r border-white/5 overflow-hidden">
          {/* Subtle background image to tie both panels together cohesively */}
          <img 
            src="/hands_banner.jpg" 
            alt="Eumora Music Background Logo" 
            className="absolute inset-0 w-full h-full object-cover opacity-15 filter brightness-[0.25] select-none pointer-events-none z-0"
          />
          {/* Solid gradient cover overlay to ensure inputs and text have maximum readability */}
          <div className="absolute inset-0 bg-[#0a0a0c]/85 z-10 pointer-events-none" />

          {/* Brand Logo Header */}
          <div className="relative flex items-center gap-3 mb-10 select-none z-20">
            <img 
              src="/app_icon.png" 
              alt="Eumora Music Logo" 
              className="h-10 w-10 rounded-full object-cover border border-white/10 shadow-md logo-glow-anim select-none pointer-events-none"
            />
            <span className="text-xl font-black tracking-tight text-white">
              Eumora <span className="text-[#1db954]">Music</span>
            </span>
          </div>

          {/* Form Content Wrapper with transition */}
          <div 
            className={cn(
              "relative transition-all duration-200 ease-out z-20",
              isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}
          >
            {/* Header titles */}
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2">
                {state === "login" && "¡Hola de nuevo!"}
                {state === "register" && "Crear una cuenta"}
                {state === "verify" && "Confirmar código"}
                {state === "forgot" && "¿Olvidaste tu contraseña?"}
                {state === "reset" && "Nueva contraseña"}
              </h2>
              <div className="min-h-[48px]">
                <p 
                  className={cn(
                    "text-xs text-neutral-400 leading-relaxed font-medium transition-all duration-300 select-none",
                    fadeSubtitle ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                  )}
                >
                  {(SUBTITLES[state] || SUBTITLES.login)[subtitleIndex]}
                </p>
              </div>
            </div>

            {/* LOGIN VIEW */}
            {state === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Correo Electrónico</label>
                  <div className="relative group">
                    <Mail className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500 transition-colors duration-200 group-focus-within:text-[#1db954]" />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-[#121214] py-3.5 pr-4 pl-10.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 hover:border-neutral-700/80 focus:border-[#1db954] focus:bg-[#151518] focus:ring-2 focus:ring-[#1db954]/10 focus:shadow-[0_0_20px_rgba(29,185,84,0.1)]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => changeState("forgot")}
                      className="text-[10.5px] font-bold text-[#1db954] hover:text-[#1ed760] transition-colors link-underline"
                    >
                      ¿La olvidaste?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500 transition-colors duration-200 group-focus-within:text-[#1db954]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-[#121214] py-3.5 pr-10.5 pl-10.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 hover:border-neutral-700/80 focus:border-[#1db954] focus:bg-[#151518] focus:ring-2 focus:ring-[#1db954]/10 focus:shadow-[0_0_20px_rgba(29,185,84,0.1)]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3.5 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#1db954] py-3.5 text-xs font-extrabold text-black transition-all duration-200 hover:bg-[#1ed760] hover:shadow-[0_0_25px_rgba(29,185,84,0.3)] active:scale-[0.99] disabled:opacity-75 cursor-pointer shadow-md shadow-[#1db954]/10 animate-shimmer"
                >
                  {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Iniciar Sesión"}
                </button>

                <div className="mt-4 text-center text-xs text-neutral-400">
                  ¿No tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => changeState("register")}
                    className="font-bold text-white hover:text-[#1db954] transition-colors link-underline"
                  >
                    Regístrate gratis
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER VIEW */}
            {state === "register" && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Nombre de Usuario</label>
                  <div className="relative group">
                    <UserIcon className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500 transition-colors duration-200 group-focus-within:text-[#1db954]" />
                    <input
                      type="text"
                      placeholder="Tu nombre o apodo"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-[#121214] py-3.5 pr-4 pl-10.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 hover:border-neutral-700/80 focus:border-[#1db954] focus:bg-[#151518] focus:ring-2 focus:ring-[#1db954]/10 focus:shadow-[0_0_20px_rgba(29,185,84,0.1)]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Correo Electrónico</label>
                  <div className="relative group">
                    <Mail className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500 transition-colors duration-200 group-focus-within:text-[#1db954]" />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-[#121214] py-3.5 pr-4 pl-10.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 hover:border-neutral-700/80 focus:border-[#1db954] focus:bg-[#151518] focus:ring-2 focus:ring-[#1db954]/10 focus:shadow-[0_0_20px_rgba(29,185,84,0.1)]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500 transition-colors duration-200 group-focus-within:text-[#1db954]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-[#121214] py-3.5 pr-10.5 pl-10.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 hover:border-neutral-700/80 focus:border-[#1db954] focus:bg-[#151518] focus:ring-2 focus:ring-[#1db954]/10 focus:shadow-[0_0_20px_rgba(29,185,84,0.1)]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3.5 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#1db954] py-3.5 text-xs font-extrabold text-black transition-all duration-200 hover:bg-[#1ed760] hover:shadow-[0_0_25px_rgba(29,185,84,0.3)] active:scale-[0.99] disabled:opacity-75 cursor-pointer shadow-md shadow-[#1db954]/10 animate-shimmer"
                >
                  {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Crear Cuenta"}
                </button>

                <div className="mt-4 text-center text-xs text-neutral-400">
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => changeState("login")}
                    className="font-bold text-white hover:text-[#1db954] transition-colors link-underline"
                  >
                    Inicia sesión
                  </button>
                </div>
              </form>
            )}

            {/* VERIFY OTP VIEW */}
            {state === "verify" && (
              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => changeState("register")}
                  className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer self-start link-underline"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver al registro
                </button>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Código de Verificación</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500 transition-colors duration-200 group-focus-within:text-[#1db954]" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="••••••"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full tracking-[10px] text-center font-mono rounded-xl border border-neutral-800 bg-[#121214] py-3.5 text-base font-bold text-[#1db954] placeholder-neutral-600 outline-none transition-all duration-200 focus:border-[#1db954] focus:bg-[#151518] focus:ring-2 focus:ring-[#1db954]/10"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                    Si no configuraste el SMTP de correo, el código OTP se imprimirá directamente en la consola del servidor de Node.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#1db954] py-3.5 text-xs font-extrabold text-black transition-all duration-200 hover:bg-[#1ed760] hover:shadow-[0_0_25px_rgba(29,185,84,0.3)] active:scale-[0.99] disabled:opacity-75 cursor-pointer shadow-md shadow-[#1db954]/10 animate-shimmer"
                >
                  {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Verificar e Ingresar"}
                </button>

                <div className="mt-3 text-center text-xs text-neutral-400">
                  ¿No recibiste el código?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending || loading}
                    className="font-bold text-white hover:text-[#1db954] hover:underline disabled:opacity-50 transition-colors link-underline"
                  >
                    {resending ? "Reenviando..." : "Reenviar código"}
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {state === "forgot" && (
              <form onSubmit={handleForgot} className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => changeState("login")}
                  className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer self-start link-underline"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver al login
                </button>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Correo Electrónico</label>
                  <div className="relative group">
                    <Mail className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500 transition-colors duration-200 group-focus-within:text-[#1db954]" />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-[#121214] py-3.5 pr-4 pl-10.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 hover:border-neutral-700/80 focus:border-[#1db954] focus:bg-[#151518] focus:ring-2 focus:ring-[#1db954]/10 focus:shadow-[0_0_20px_rgba(29,185,84,0.1)]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#1db954] py-3.5 text-xs font-extrabold text-black transition-all duration-200 hover:bg-[#1ed760] hover:shadow-[0_0_25px_rgba(29,185,84,0.3)] active:scale-[0.99] disabled:opacity-75 cursor-pointer shadow-md shadow-[#1db954]/10 animate-shimmer"
                >
                  {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Enviar Código"}
                </button>
              </form>
            )}

            {/* RESET PASSWORD VIEW */}
            {state === "reset" && (
              <form onSubmit={handleReset} className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => changeState("forgot")}
                  className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer self-start link-underline"
                >
                  <ArrowLeft className="h-4 w-4" /> Cambiar correo
                </button>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Código de 6 dígitos</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500 transition-colors duration-200 group-focus-within:text-[#1db954]" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Ingresa el código"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full tracking-[6px] text-center font-mono rounded-xl border border-neutral-800 bg-[#121214] py-3.5 text-xs text-[#1db954] placeholder-neutral-600 outline-none transition-all duration-200 focus:border-[#1db954] focus:bg-[#151518] focus:ring-2 focus:ring-[#1db954]/10"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Nueva Contraseña</label>
                  <div className="relative group">
                    <KeyRound className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500 transition-colors duration-200 group-focus-within:text-[#1db954]" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-[#121214] py-3.5 pr-10.5 pl-10.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-200 hover:border-neutral-700/80 focus:border-[#1db954] focus:bg-[#151518] focus:ring-2 focus:ring-[#1db954]/10 focus:shadow-[0_0_20px_rgba(29,185,84,0.1)]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute top-1/2 right-3.5 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#1db954] py-3.5 text-xs font-extrabold text-black transition-all duration-200 hover:bg-[#1ed760] hover:shadow-[0_0_25px_rgba(29,185,84,0.3)] active:scale-[0.99] disabled:opacity-75 cursor-pointer shadow-md shadow-[#1db954]/10 animate-shimmer"
                >
                  {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Restablecer e Iniciar Sesión"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Visual Banner Column (Hidden on mobile) */}
        <div className="relative hidden md:flex md:col-span-7 flex-col justify-between p-16 overflow-hidden bg-black select-none z-10">
          {/* High-quality background image asset (Hands green wallpaper) */}
          <img 
            src="/hands_banner.jpg" 
            alt="Eumora Music Premium Banner" 
            className="absolute inset-0 w-full h-full object-cover opacity-75 filter brightness-[0.45]"
          />
          {/* Subtle gradient overlay to make text highly readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/45 to-black/10 z-10" />

          {/* Premium Tag Badge */}
          <div className="z-20 flex items-center gap-2 bg-black/45 backdrop-blur-md px-4.5 py-2 rounded-full border border-white/5 self-start shadow-xl">
            <div className="h-2 w-2 rounded-full bg-[#1db954] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-200">Experiencia Premium</span>
          </div>

          {/* Large Slogan/Quote Block wrapped in blurred glassmorphic card */}
          <div className="z-20 max-w-xl space-y-4 bg-black/30 backdrop-blur-md p-8 rounded-2xl border border-white/5 shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Siente el ritmo,<br />vive la música.
            </h2>
            <p className="text-sm lg:text-base text-neutral-300 font-medium leading-relaxed">
              Únete a Eumora Music y disfruta de toda tu biblioteca personal con la máxima calidad de audio, sin límites y completamente libre.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
