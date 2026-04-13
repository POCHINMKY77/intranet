'use client'
import { useEffect, useState } from 'react'
import {
    Eye, Type, ZoomIn, ZoomOut, Moon, Contrast,
    Volume2, RefreshCw, X, Accessibility, AlignLeft, AlignCenter
} from 'lucide-react'

export default function AccessibilityWidget() {
    const [mounted, setMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [settings, setSettings] = useState({
        fontSize: 100,
        highContrast: false,
        darkMode: false,
        lineHeight: 1.5,
        letterSpacing: 0,
        grayscale: false,
        reducedMotion: false,
        focusOutline: true
    })

    const aplicarEstilos = (newSettings: any) => {
        if (typeof document === 'undefined') return

        const root = document.documentElement
        root.style.fontSize = `${newSettings.fontSize}%`
        root.style.lineHeight = String(newSettings.lineHeight)
        root.style.letterSpacing = `${newSettings.letterSpacing}px`

        if (newSettings.darkMode) {
            document.body.classList.add('dark-mode')
        } else {
            document.body.classList.remove('dark-mode')
        }

        if (newSettings.highContrast) {
            document.body.classList.add('high-contrast')
        } else {
            document.body.classList.remove('high-contrast')
        }

        if (newSettings.grayscale) {
            document.body.classList.add('grayscale')
        } else {
            document.body.classList.remove('grayscale')
        }

        if (newSettings.reducedMotion) {
            document.body.classList.add('reduced-motion')
        } else {
            document.body.classList.remove('reduced-motion')
        }

        if (newSettings.focusOutline) {
            document.body.classList.add('focus-visible')
        } else {
            document.body.classList.remove('focus-visible')
        }

        localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings))
    }

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem('accessibilitySettings')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setSettings(parsed)
                aplicarEstilos(parsed)
            } catch (e) {
                console.error('Error loading settings', e)
            }
        }
    }, [])

    useEffect(() => {
        if (mounted) {
            aplicarEstilos(settings)
        }
    }, [settings, mounted])

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
    }

    const resetSettings = () => {
        const defaultSettings = {
            fontSize: 100,
            highContrast: false,
            darkMode: false,
            lineHeight: 1.5,
            letterSpacing: 0,
            grayscale: false,
            reducedMotion: false,
            focusOutline: true
        }
        setSettings(defaultSettings)
    }

    if (!mounted) {
        return null
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label="Abrir panel de accesibilidad"
                title="Opciones de accesibilidad"
            >
                <Accessibility className="w-6 h-6" />
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Accessibility className="w-5 h-5" />
                                <h3 className="font-semibold">Opciones de Accesibilidad</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition"
                                aria-label="Cerrar panel"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-blue-100 mt-1">Personaliza la vista según tus necesidades</p>
                    </div>

                    <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                        {/* Tamaño de texto */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Type className="w-4 h-4" />
                                Tamaño del texto
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateSetting('fontSize', Math.max(70, settings.fontSize - 10))}
                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                    aria-label="Disminuir tamaño de texto"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-medium w-12 text-center">{settings.fontSize}%</span>
                                <button
                                    onClick={() => updateSetting('fontSize', Math.min(150, settings.fontSize + 10))}
                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                    aria-label="Aumentar tamaño de texto"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => updateSetting('fontSize', 100)}
                                    className="px-3 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Espaciado entre líneas */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <AlignLeft className="w-4 h-4" />
                                Espaciado entre líneas
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="1"
                                    max="2.5"
                                    step="0.1"
                                    value={settings.lineHeight}
                                    onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium w-12 text-center">{settings.lineHeight.toFixed(1)}</span>
                            </div>
                        </div>

                        {/* Espaciado entre letras */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <AlignCenter className="w-4 h-4" />
                                Espaciado entre letras
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="3"
                                    step="0.5"
                                    value={settings.letterSpacing}
                                    onChange={(e) => updateSetting('letterSpacing', parseFloat(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium w-12 text-center">{settings.letterSpacing}px</span>
                            </div>
                        </div>

                        {/* Modo oscuro */}
                        <div className="flex items-center justify-between py-2 border-t border-gray-100">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Moon className="w-4 h-4" />
                                Modo oscuro
                            </label>
                            <button
                                onClick={() => updateSetting('darkMode', !settings.darkMode)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Alto contraste */}
                        <div className="flex items-center justify-between py-2 border-t border-gray-100">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Contrast className="w-4 h-4" />
                                Alto contraste
                            </label>
                            <button
                                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.highContrast ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Escala de grises */}
                        <div className="flex items-center justify-between py-2 border-t border-gray-100">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Eye className="w-4 h-4" />
                                Escala de grises
                            </label>
                            <button
                                onClick={() => updateSetting('grayscale', !settings.grayscale)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.grayscale ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.grayscale ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Reducir movimiento */}
                        <div className="flex items-center justify-between py-2 border-t border-gray-100">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Volume2 className="w-4 h-4" />
                                Reducir movimiento
                            </label>
                            <button
                                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Botón de reinicio */}
                        <button
                            onClick={resetSettings}
                            className="w-full mt-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Restablecer configuración
                        </button>

                        {/* Ayuda */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 text-center">
                                🔍 Usa Tab para navegar | Enter para seleccionar
                                <br />
                                📢 Compatible con lectores de pantalla
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
        body.dark-mode {
          background: #1a1a2e !important;
          color: #e0e0e0 !important;
        }
        body.dark-mode .bg-white {
          background: #16213e !important;
        }
        body.high-contrast {
          background: #000 !important;
          color: #fff !important;
        }
        body.high-contrast .bg-white {
          background: #000 !important;
          border: 1px solid #fff !important;
        }
        body.grayscale {
          filter: grayscale(100%);
        }
        body.reduced-motion * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
        body.focus-visible :focus {
          outline: 3px solid #2563eb !important;
          outline-offset: 2px !important;
        }
      `}</style>
        </>
    )
}
