"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, User, LogOut, ChevronDown, Settings } from "lucide-react"
import { useAuth } from "./auth-provider"
import { useNavigation } from "./navigation-provider"

export function TopBar() {
  const { user, logout } = useAuth()
  const { goBack, canGoBack, navigateTo } = useNavigation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Capitalize first letter of username for avatar
  const avatarLetter = user?.username ? user.username.charAt(0).toUpperCase() : "U"

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-[#121212]/80 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <button
          aria-label="Back"
          onClick={goBack}
          disabled={!canGoBack}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-foreground transition-colors hover:bg-black disabled:opacity-40 disabled:hover:bg-black/80 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Forward"
          disabled
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-muted-foreground transition-colors hover:bg-black opacity-30 cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Academic Project Badge */}
        <span className="hidden rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold text-[#1db954] sm:block">
          Proyecto Académico
        </span>

        {/* User Profile Dropdown */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full bg-black hover:bg-[#282828] p-1 pr-3 text-sm font-semibold transition-all focus:outline-none"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-7 w-7 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1db954] text-black font-extrabold text-xs shrink-0">
                  {avatarLetter}
                </div>
              )}
              <span className="max-w-[120px] truncate text-white hidden sm:block">
                {user.username}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-lg border border-neutral-800 bg-[#181818] p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-neutral-800">
                  <p className="text-xs text-neutral-400 font-medium">Conectado como</p>
                  <p className="text-sm text-white font-bold truncate mt-0.5">{user.username}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    navigateTo("settings")
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-neutral-300 font-semibold hover:bg-neutral-800 hover:text-white transition-colors text-left mt-1.5 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  Configuración
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-red-400 font-semibold hover:bg-neutral-800 hover:text-red-300 transition-colors text-left mt-1 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            aria-label="Profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground animate-pulse"
          >
            <User className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
