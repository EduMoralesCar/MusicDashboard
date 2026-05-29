"use client"

import { useState, useRef } from "react"
import { useAuth } from "./auth-provider"
import { usePlayer } from "./player-provider"
import { toast } from "sonner"
import { User, Camera, Clock, Save, ShieldAlert, ArrowLeft } from "lucide-react"
import { useNavigation } from "./navigation-provider"

export function SettingsView() {
  const { user, refreshUser } = useAuth()
  const { sleepTimerDuration, sleepTimerRemaining, setSleepTimer } = usePlayer()
  const { goBack } = useNavigation()

  const [username, setUsername] = useState(user?.username || "")
  const [isSavingUsername, setIsSavingUsername] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Format remaining seconds into MM:SS
  const formatRemainingTime = (totalSeconds: number | null) => {
    if (totalSeconds === null || totalSeconds <= 0) return ""
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle username update
  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || username.trim().length < 3) {
      toast.error("El nombre de usuario debe tener al menos 3 caracteres.")
      return
    }

    setIsSavingUsername(true)
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      })

      if (res.ok) {
        await refreshUser()
        toast.success("¡Nombre de usuario actualizado con éxito!")
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al actualizar el nombre de usuario.")
      }
    } catch (err) {
      toast.error("Error de conexión al guardar el perfil.")
    } finally {
      setIsSavingUsername(false)
    }
  }

  // Handle avatar upload and Base64 conversion
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit file size to 2MB to keep DB storage reasonable for Base64
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande. El límite es de 2MB.")
      return
    }

    setIsUploadingAvatar(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      try {
        const res = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user?.username || username, avatar: base64String }),
        })

        if (res.ok) {
          await refreshUser()
          toast.success("¡Foto de perfil actualizada correctamente!")
        } else {
          const data = await res.json()
          toast.error(data.error || "Error al subir la imagen.")
        }
      } catch (err) {
        toast.error("Error al subir la imagen al servidor.")
      } finally {
        setIsUploadingAvatar(false)
      }
    }
    reader.onerror = () => {
      toast.error("Error al leer el archivo.")
      setIsUploadingAvatar(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="mx-auto max-w-3xl py-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header back link */}
      <button
        onClick={goBack}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Volver
      </button>

      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-8">Configuración</h1>

      <div className="flex flex-col gap-8">
        {/* Section 1: User Profile Details */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm shadow-md">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-[#1db954]" />
            Editar Perfil
          </h2>

          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            {/* Left: Interactive Avatar Picker */}
            <div className="flex flex-col items-center gap-3">
              <div
                onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                className="group relative flex h-32 w-32 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-neutral-700 bg-neutral-800 transition-all hover:border-[#1db954] shadow-lg"
              >
                {isUploadingAvatar ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                    <Camera className="h-6 w-6 text-white mb-1" />
                    <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Cambiar</span>
                  </div>
                )}

                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-extrabold bg-[#1db954] text-black">
                    {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
                disabled={isUploadingAvatar}
              />
              <p className="text-[11px] text-neutral-500 font-medium max-w-[150px] text-center">
                Límite de tamaño: 2MB. Formatos recomendados: JPG, PNG.
              </p>
            </div>

            {/* Right: Username Form */}
            <form onSubmit={handleSaveUsername} className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="username-input" className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Nombre de usuario
                </label>
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  disabled={isSavingUsername}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#1db954] focus:outline-none focus:ring-1 focus:ring-[#1db954] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-2.5 text-sm text-neutral-500 cursor-not-allowed select-none"
                />
                <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> El correo electrónico no se puede modificar.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSavingUsername || username === user?.username}
                className="flex items-center justify-center gap-2 self-start rounded-full bg-white px-6 py-2 text-sm font-bold text-black transition-all hover:scale-105 hover:bg-neutral-100 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed mt-2"
              >
                {isSavingUsername ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar Cambios
              </button>
            </form>
          </div>
        </section>

        {/* Section 2: Sleep Timer / Apagado Automático */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm shadow-md">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#1db954]" />
            Temporizador de Apagado (Sleep Timer)
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            Configura el reproductor para pausar automáticamente la música después de transcurrido el tiempo seleccionado.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { value: null, label: "Desactivado" },
              { value: 10, label: "10 Minutos" },
              { value: 20, label: "20 Minutos" },
              { value: 30, label: "30 Minutos" },
              { value: 60, label: "1 Hora" },
            ].map((option) => {
              const active = sleepTimerDuration === option.value
              return (
                <button
                  key={option.value === null ? "off" : option.value}
                  onClick={() => {
                    setSleepTimer(option.value)
                    if (option.value === null) {
                      toast.success("Temporizador de apagado desactivado.")
                    } else {
                      toast.success(`Temporizador activado por ${option.label}.`)
                    }
                  }}
                  className={`rounded-lg p-3 text-center border transition-all text-xs font-bold cursor-pointer hover:scale-102 ${
                    active
                      ? "bg-white text-black border-white shadow-md scale-102"
                      : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          {/* Countdown live view */}
          {sleepTimerRemaining !== null && sleepTimerRemaining > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-lg bg-[#1db954]/10 border border-[#1db954]/20 p-4 animate-pulse">
              <span className="text-sm font-semibold text-[#1db954]">
                ⏱️ El reproductor de música se pausará automáticamente en:
              </span>
              <span className="font-mono text-lg font-bold text-white tracking-widest">
                {formatRemainingTime(sleepTimerRemaining)}
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
