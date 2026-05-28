"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Music2, Mail, Lock, User as UserIcon, ShieldCheck, ArrowLeft, Loader2, KeyRound } from "lucide-react"
import { toast } from "sonner"

type AuthState = "login" | "register" | "verify" | "forgot" | "reset"

export default function AuthPage() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>("login")
  const [loading, setLoading] = useState(false)
  
  // Form values
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  
  // Track email for verification flow
  const [flowEmail, setFlowEmail] = useState("")

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
          setState("verify")
        } else {
          toast.error(data.error || "Error al iniciar sesión.")
        }
        return
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
      setState("verify")
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
      setState("reset")
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

      toast.success(data.message)
      router.push("/")
      router.refresh()
    } catch (err) {
      toast.error("Error de conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0e] px-4 text-white">
      {/* Decorative background gradients */}
      <div className="absolute -top-[40%] -left-[20%] h-[80vw] w-[80vw] rounded-full bg-gradient-to-br from-[#1db954]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[40%] -right-[20%] h-[80vw] w-[80vw] rounded-full bg-gradient-to-br from-purple-500/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="z-10 w-full max-w-[450px]">
        {/* Brand Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1db954] shadow-lg shadow-[#1db954]/20 animate-pulse">
            <Music2 className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Eumora <span className="text-[#1db954]">Music</span>
          </h1>
          <p className="text-center text-sm text-neutral-400">
            {state === "login" && "Inicia sesión para escuchar millones de canciones libres"}
            {state === "register" && "Crea tu cuenta gratuita para comenzar tu experiencia"}
            {state === "verify" && `Ingresa el código OTP enviado a ${flowEmail}`}
            {state === "forgot" && "Recupera el acceso a tu biblioteca de música"}
            {state === "reset" && "Ingresa el código de recuperación y tu nueva clave"}
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-8 backdrop-blur-xl shadow-2xl">
          {/* LOGIN VIEW */}
          {state === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-[#121214] py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => setState("forgot")}
                    className="text-xs font-semibold text-[#1db954] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-[#121214] py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#1db954] py-3.5 text-sm font-bold text-black transition-all hover:bg-[#1ed760] active:scale-[0.98] disabled:opacity-70 disabled:hover:bg-[#1db954]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Iniciar Sesión"}
              </button>

              <div className="mt-2 text-center text-sm text-neutral-400">
                ¿No tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setState("register")}
                  className="font-bold text-white hover:text-[#1db954] hover:underline"
                >
                  Regístrate gratis
                </button>
              </div>
            </form>
          )}

          {/* REGISTER VIEW */}
          {state === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Nombre de Usuario</label>
                <div className="relative">
                  <UserIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Tu nombre o apodo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-[#121214] py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-[#121214] py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-[#121214] py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#1db954] py-3.5 text-sm font-bold text-black transition-all hover:bg-[#1ed760] active:scale-[0.98] disabled:opacity-70 disabled:hover:bg-[#1db954]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear Cuenta"}
              </button>

              <div className="mt-2 text-center text-sm text-neutral-400">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setState("login")}
                  className="font-bold text-white hover:text-[#1db954] hover:underline"
                >
                  Inicia sesión
                </button>
              </div>
            </form>
          )}

          {/* VERIFY OTP VIEW */}
          {state === "verify" && (
            <form onSubmit={handleVerify} className="flex flex-col gap-5">
              <button
                type="button"
                onClick={() => setState("register")}
                className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Volver al registro
              </button>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Código de Verificación (OTP)</label>
                <div className="relative">
                  <ShieldCheck className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Ingresa los 6 dígitos"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full tracking-[8px] text-center font-mono rounded-lg border border-neutral-800 bg-[#121214] py-3 pr-4 pl-10 text-lg text-[#1db954] placeholder-neutral-600 outline-none transition-all focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Revisa tu bandeja de entrada o spam. Si SMTP no está configurado, el código aparecerá en la consola del servidor.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#1db954] py-3.5 text-sm font-bold text-black transition-all hover:bg-[#1ed760] active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verificar e Ingresar"}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {state === "forgot" && (
            <form onSubmit={handleForgot} className="flex flex-col gap-5">
              <button
                type="button"
                onClick={() => setState("login")}
                className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
              </button>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-[#121214] py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#1db954] py-3.5 text-sm font-bold text-black transition-all hover:bg-[#1ed760] active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar Código de Recuperación"}
              </button>
            </form>
          )}

          {/* RESET PASSWORD VIEW */}
          {state === "reset" && (
            <form onSubmit={handleReset} className="flex flex-col gap-5">
              <button
                type="button"
                onClick={() => setState("forgot")}
                className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Cambiar correo
              </button>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Código de 6 dígitos</label>
                <div className="relative">
                  <ShieldCheck className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Ingresa el código"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full tracking-[4px] text-center font-mono rounded-lg border border-neutral-800 bg-[#121214] py-3 pr-4 pl-10 text-sm text-[#1db954] placeholder-neutral-600 outline-none transition-all focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Nueva Contraseña</label>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-[#121214] py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#1db954] py-3.5 text-sm font-bold text-black transition-all hover:bg-[#1ed760] active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Restablecer e Iniciar Sesión"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
