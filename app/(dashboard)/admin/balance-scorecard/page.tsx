'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    BarChart3, Target, TrendingUp, Users, Briefcase, BookOpen,
    AlertCircle, Shield, Calendar, CheckCircle, XCircle,
    Clock, TrendingDown, TrendingUp as TrendingUpIcon,
    Truck, FileText, Headphones, Building, Gauge
} from 'lucide-react'

// Tipos de datos
interface Indicador {
    nombre: string
    actual: number
    meta: number
    unidad: string
    progreso: number
    estado: 'verde' | 'amarillo' | 'rojo'
    tendencia: 'up' | 'down' | 'stable'
    responsable: string
    iniciativas: string
}

interface CategoriaProceso {
    nombre: string
    icono: any
    procesos: Indicador[]
}

export default function BalanceScoreCardPage() {
    const [isAdmin, setIsAdmin] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        verificarAdmin()
    }, [])

    async function verificarAdmin() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', user.id)
                .single()
            setIsAdmin(profile?.rol === 'admin')
        }
    }

    // Datos de la Perspectiva Financiera
    const financieraData: Indicador[] = [
        { nombre: "Crecimiento de ventas", actual: 12, meta: 15, unidad: "%", progreso: 80, estado: "amarillo", tendencia: "up", responsable: "Gerente Comercial", iniciativas: "Nueva campaña de marketing Q2" },
        { nombre: "Reducción de costos operativos", actual: 8, meta: 10, unidad: "%", progreso: 80, estado: "verde", tendencia: "up", responsable: "Gerente Operaciones", iniciativas: "Optimización de rutas" },
        { nombre: "Margen neto", actual: 18, meta: 20, unidad: "%", progreso: 90, estado: "amarillo", tendencia: "up", responsable: "CFO", iniciativas: "Control de gastos administrativos" },
        { nombre: "Días de cobro", actual: 35, meta: 30, unidad: "días", progreso: 50, estado: "rojo", tendencia: "down", responsable: "CFO", iniciativas: "Facturación electrónica" }
    ]

    // Datos de la Perspectiva Clientes
    const clientesData: Indicador[] = [
        { nombre: "NPS (Satisfacción)", actual: 65, meta: 70, unidad: "puntos", progreso: 70, estado: "amarillo", tendencia: "up", responsable: "Gerente Comercial", iniciativas: "Encuestas post-servicio" },
        { nombre: "Tasa de reclamos", actual: 2.5, meta: 2, unidad: "%", progreso: 40, estado: "rojo", tendencia: "down", responsable: "Gerente Operaciones", iniciativas: "Capacitación a conductores" },
        { nombre: "Entregas a tiempo", actual: 95, meta: 98, unidad: "%", progreso: 75, estado: "amarillo", tendencia: "up", responsable: "Gerente Operaciones", iniciativas: "GPS en flota" },
        { nombre: "Tasa de retención", actual: 82, meta: 85, unidad: "%", progreso: 80, estado: "verde", tendencia: "up", responsable: "Gerente Comercial", iniciativas: "Programa de lealtad" }
    ]

    // Datos de Procesos Internos - DETALLADO POR CATEGORÍA
    const procesosData: CategoriaProceso[] = [
        {
            nombre: "LOGÍSTICA Y TRANSPORTE",
            icono: Truck,
            procesos: [
                { nombre: "Tiempo de entrega", actual: 28, meta: 24, unidad: "horas", progreso: 40, estado: "rojo", tendencia: "down", responsable: "Gerente Operaciones", iniciativas: "Optimización de rutas" },
                { nombre: "Entregas puntuales", actual: 95, meta: 98, unidad: "%", progreso: 75, estado: "amarillo", tendencia: "up", responsable: "Gerente Operaciones", iniciativas: "GPS en flota" },
                { nombre: "Optimización rutas", actual: 10, meta: 15, unidad: "% mejora", progreso: 65, estado: "amarillo", tendencia: "up", responsable: "Gerente Operaciones", iniciativas: "Software de planificación" },
                { nombre: "Errores logísticos", actual: 1.5, meta: 1, unidad: "%", progreso: 30, estado: "rojo", tendencia: "down", responsable: "Gerente Operaciones", iniciativas: "Control de calidad" }
            ]
        },
        {
            nombre: "GESTIÓN ADMINISTRATIVA",
            icono: Building,
            procesos: [
                { nombre: "Digitalización trámites", actual: 85, meta: 100, unidad: "%", progreso: 85, estado: "verde", tendencia: "up", responsable: "TI", iniciativas: "Portal de autoservicio" },
                { nombre: "Tiempo aprobación solicitudes", actual: 3, meta: 1, unidad: "días", progreso: 40, estado: "rojo", tendencia: "down", responsable: "RRHH", iniciativas: "Automatizar flujos" }
            ]
        },
        {
            nombre: "ATENCIÓN AL CLIENTE",
            icono: Headphones,
            procesos: [
                { nombre: "Resolución de quejas", actual: 48, meta: 24, unidad: "horas", progreso: 50, estado: "rojo", tendencia: "down", responsable: "Gerente Comercial", iniciativas: "Capacitación al cliente" },
                { nombre: "Satisfacción post-venta", actual: 65, meta: 70, unidad: "NPS", progreso: 70, estado: "amarillo", tendencia: "up", responsable: "Gerente Comercial", iniciativas: "Seguimiento personalizado" }
            ]
        }
    ]

    // Datos de Aprendizaje y Crecimiento
    const aprendizajeData: Indicador[] = [
        { nombre: "Horas de capacitación/año", actual: 15, meta: 20, unidad: "horas", progreso: 75, estado: "amarillo", tendencia: "up", responsable: "RRHH", iniciativas: "Plataforma e-learning" },
        { nombre: "Tasa de rotación", actual: 12, meta: 10, unidad: "%", progreso: 40, estado: "rojo", tendencia: "down", responsable: "RRHH", iniciativas: "Plan de carrera" },
        { nombre: "Uso del portal", actual: 70, meta: 100, unidad: "%", progreso: 70, estado: "amarillo", tendencia: "up", responsable: "TI", iniciativas: "Capacitación en portal" },
        { nombre: "Clima laboral", actual: 78, meta: 85, unidad: "%", progreso: 65, estado: "amarillo", tendencia: "up", responsable: "RRHH", iniciativas: "Encuestas trimestrales" }
    ]

    // Función para calcular el progreso promedio de una categoría
    const calcularPromedio = (indicadores: Indicador[]) => {
        const suma = indicadores.reduce((acc, i) => acc + i.progreso, 0)
        return Math.round(suma / indicadores.length)
    }

    // Función para obtener el color del estado
    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'verde': return 'bg-green-500'
            case 'amarillo': return 'bg-yellow-500'
            case 'rojo': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    // Función para obtener el color del texto del estado
    const getEstadoTextColor = (estado: string) => {
        switch (estado) {
            case 'verde': return 'text-green-600 bg-green-50'
            case 'amarillo': return 'text-yellow-600 bg-yellow-50'
            case 'rojo': return 'text-red-600 bg-red-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    // Función para obtener el icono de tendencia
    const getTendenciaIcon = (tendencia: string) => {
        switch (tendencia) {
            case 'up': return <TrendingUpIcon className="w-3 h-3 text-green-500" />
            case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />
            default: return <Minus className="w-3 h-3 text-gray-500" />
        }
    }

    // Función para obtener el ícono del semáforo
    const getSemaforo = (estado: string) => {
        switch (estado) {
            case 'verde': return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'amarillo': return <Clock className="w-5 h-5 text-yellow-500" />
            case 'rojo': return <XCircle className="w-5 h-5 text-red-500" />
            default: return <AlertCircle className="w-5 h-5 text-gray-500" />
        }
    }

    // Calcular progresos globales
    const progresoFinanciero = calcularPromedio(financieraData)
    const progresoClientes = calcularPromedio(clientesData)
    const progresoAprendizaje = calcularPromedio(aprendizajeData)

    // Calcular progreso de Procesos Internos (promedio de todas las categorías)
    const todosProcesos = procesosData.flatMap(cat => cat.procesos)
    const progresoProcesos = calcularPromedio(todosProcesos)
    const progresoGlobal = Math.round((progresoFinanciero + progresoClientes + progresoProcesos + progresoAprendizaje) / 4)

    // Obtener acciones prioritarias (indicadores en rojo)
    const accionesPrioritarias = [
        ...financieraData.filter(i => i.estado === 'rojo').map(i => ({ ...i, perspectiva: 'Financiera' })),
        ...clientesData.filter(i => i.estado === 'rojo').map(i => ({ ...i, perspectiva: 'Clientes' })),
        ...todosProcesos.filter(i => i.estado === 'rojo').map(i => ({ ...i, perspectiva: 'Procesos' })),
        ...aprendizajeData.filter(i => i.estado === 'rojo').map(i => ({ ...i, perspectiva: 'Aprendizaje' }))
    ]

    // Componente de barra de progreso
    const BarraProgreso = ({ progreso, estado }: { progreso: number; estado: string }) => (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
                className={`${getEstadoColor(estado)} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${progreso}%` }}
            />
        </div>
    )

    // Componente de tarjeta de indicador
    const TarjetaIndicador = ({ indicador }: { indicador: Indicador }) => (
        <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {getSemaforo(indicador.estado)}
                    <span className="font-medium text-gray-900 text-sm">{indicador.nombre}</span>
                </div>
                <div className="flex items-center gap-1">
                    {getTendenciaIcon(indicador.tendencia)}
                </div>
            </div>
            <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl font-bold text-gray-900">
                    {indicador.actual}{indicador.unidad}
                </span>
                <span className="text-sm text-gray-400">
                    Meta: {indicador.meta}{indicador.unidad}
                </span>
            </div>
            <BarraProgreso progreso={indicador.progreso} estado={indicador.estado} />
            <div className="mt-2 text-xs text-gray-500">
                <span className="block truncate">📋 {indicador.responsable}</span>
                <span className="block truncate text-gray-400">🎯 {indicador.iniciativas}</span>
            </div>
        </div>
    )

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
                    <p className="text-gray-600 mt-2">No tienes permisos para ver esta página</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-8 h-8" />
                    <h1 className="text-2xl font-bold">Balance Score Card</h1>
                </div>
                <p className="text-blue-100">LogiTrack - Cuadro de Mando Integral 2026</p>
            </div>

            {/* Misión y Visión */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Misión</h2>
                    </div>
                    <p className="text-gray-700">
                        Ofrecer soluciones logísticas eficientes y confiables, conectando a nuestros clientes
                        con sus mercancías en todo el país, con el apoyo de un equipo humano comprometido
                        y tecnología de punta.
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Visión</h2>
                    </div>
                    <p className="text-gray-700">
                        Ser la empresa líder en logística y transporte en Ecuador para el año 2030,
                        reconocida por nuestra innovación, puntualidad y excelente servicio al cliente.
                    </p>
                </div>
            </div>

            {/* Perspectiva Financiera */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-white" />
                            <h2 className="text-lg font-semibold text-white">Perspectiva Financiera</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-sm">Progreso:</span>
                            <div className="w-32 bg-white/30 rounded-full h-2">
                                <div className="bg-white h-2 rounded-full" style={{ width: `${progresoFinanciero}%` }} />
                            </div>
                            <span className="text-white font-bold">{progresoFinanciero}%</span>
                            {progresoFinanciero >= 80 ? (
                                <CheckCircle className="w-5 h-5 text-green-300" />
                            ) : progresoFinanciero >= 50 ? (
                                <Clock className="w-5 h-5 text-yellow-300" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-300" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {financieraData.map((indicador, idx) => (
                            <TarjetaIndicador key={idx} indicador={indicador} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Perspectiva Clientes */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-white" />
                            <h2 className="text-lg font-semibold text-white">Perspectiva Clientes</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-sm">Progreso:</span>
                            <div className="w-32 bg-white/30 rounded-full h-2">
                                <div className="bg-white h-2 rounded-full" style={{ width: `${progresoClientes}%` }} />
                            </div>
                            <span className="text-white font-bold">{progresoClientes}%</span>
                            {progresoClientes >= 80 ? (
                                <CheckCircle className="w-5 h-5 text-green-300" />
                            ) : progresoClientes >= 50 ? (
                                <Clock className="w-5 h-5 text-yellow-300" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-300" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {clientesData.map((indicador, idx) => (
                            <TarjetaIndicador key={idx} indicador={indicador} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Perspectiva Procesos Internos (DETALLADA) */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-white" />
                            <h2 className="text-lg font-semibold text-white">Procesos Internos</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-sm">Progreso:</span>
                            <div className="w-32 bg-white/30 rounded-full h-2">
                                <div className="bg-white h-2 rounded-full" style={{ width: `${progresoProcesos}%` }} />
                            </div>
                            <span className="text-white font-bold">{progresoProcesos}%</span>
                            {progresoProcesos >= 80 ? (
                                <CheckCircle className="w-5 h-5 text-green-300" />
                            ) : progresoProcesos >= 50 ? (
                                <Clock className="w-5 h-5 text-yellow-300" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-300" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    {procesosData.map((categoria, catIdx) => {
                        const Icon = categoria.icono
                        const promedioCategoria = calcularPromedio(categoria.procesos)
                        return (
                            <div key={catIdx} className="mb-6 last:mb-0">
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-semibold text-gray-800">{categoria.nombre}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Progreso:</span>
                                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className={`${getEstadoColor(promedioCategoria >= 80 ? 'verde' : promedioCategoria >= 50 ? 'amarillo' : 'rojo')} h-1.5 rounded-full`}
                                                style={{ width: `${promedioCategoria}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium">{promedioCategoria}%</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {categoria.procesos.map((indicador, idx) => (
                                        <TarjetaIndicador key={idx} indicador={indicador} />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Perspectiva Aprendizaje y Crecimiento */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-white" />
                            <h2 className="text-lg font-semibold text-white">Aprendizaje y Crecimiento</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-sm">Progreso:</span>
                            <div className="w-32 bg-white/30 rounded-full h-2">
                                <div className="bg-white h-2 rounded-full" style={{ width: `${progresoAprendizaje}%` }} />
                            </div>
                            <span className="text-white font-bold">{progresoAprendizaje}%</span>
                            {progresoAprendizaje >= 80 ? (
                                <CheckCircle className="w-5 h-5 text-green-300" />
                            ) : progresoAprendizaje >= 50 ? (
                                <Clock className="w-5 h-5 text-yellow-300" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-300" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {aprendizajeData.map((indicador, idx) => (
                            <TarjetaIndicador key={idx} indicador={indicador} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Resumen General */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                    <Gauge className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">Resumen General de Cumplimiento</h2>
                </div>

                {/* Barras por perspectiva */}
                <div className="space-y-3 mb-6">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Financiera</span>
                            <span>{progresoFinanciero}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progresoFinanciero}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Clientes</span>
                            <span>{progresoClientes}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progresoClientes}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Procesos Internos</span>
                            <span>{progresoProcesos}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${progresoProcesos}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Aprendizaje y Crecimiento</span>
                            <span>{progresoAprendizaje}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${progresoAprendizaje}%` }} />
                        </div>
                    </div>
                </div>

                {/* Total Global */}
                <div className="pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold">CUMPLIMIENTO GLOBAL</span>
                        <span className="text-3xl font-bold">{progresoGlobal}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ${progresoGlobal >= 80 ? 'bg-green-500' : progresoGlobal >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${progresoGlobal}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-400 mt-3 text-center">
                        Objetivo General 2026: Alcanzar 85% de cumplimiento
                    </p>
                </div>
            </div>

            {/* Próximas Acciones Prioritarias */}
            {accionesPrioritarias.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-white" />
                            <h2 className="text-lg font-semibold text-white">Próximas Acciones Prioritarias</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {accionesPrioritarias.map((accion, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{accion.nombre}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getEstadoTextColor(accion.estado)}`}>
                                                {accion.perspectiva}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            <strong>Responsable:</strong> {accion.responsable} |
                                            <strong> Iniciativa:</strong> {accion.iniciativas}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Actual: {accion.actual}{accion.unidad} | Meta: {accion.meta}{accion.unidad}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mapa Estratégico */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-white" />
                        <h2 className="text-lg font-semibold text-white">Mapa Estratégico (Relaciones Causa-Efecto)</h2>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex flex-col items-center">
                        {/* Aprendizaje */}
                        <div className="text-center mb-4">
                            <div className="bg-purple-100 rounded-xl p-4 inline-block">
                                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <p className="font-semibold text-purple-800">Aprendizaje y Crecimiento</p>
                                <p className="text-sm text-purple-600">Capacitación + Reducción rotación</p>
                            </div>
                        </div>
                        <div className="text-2xl text-gray-400 mb-4">↓</div>
                        {/* Procesos */}
                        <div className="text-center mb-4">
                            <div className="bg-orange-100 rounded-xl p-4 inline-block">
                                <Briefcase className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                <p className="font-semibold text-orange-800">Procesos Internos</p>
                                <p className="text-sm text-orange-600">Optimización + Digitalización</p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-8 mb-4">
                            <div className="text-2xl text-gray-400">↙️</div>
                            <div className="text-2xl text-gray-400">↘️</div>
                        </div>
                        <div className="flex justify-center gap-8">
                            {/* Clientes */}
                            <div className="text-center">
                                <div className="bg-blue-100 rounded-xl p-4 inline-block">
                                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="font-semibold text-blue-800">Clientes</p>
                                    <p className="text-sm text-blue-600">Satisfacción + Fidelización</p>
                                </div>
                            </div>
                            {/* Financiera */}
                            <div className="text-center">
                                <div className="bg-green-100 rounded-xl p-4 inline-block">
                                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="font-semibold text-green-800">Financiera</p>
                                    <p className="text-sm text-green-600">Ingresos + Rentabilidad</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Las mejoras en capacitación y clima laboral impactan positivamente en los procesos internos,
                        lo que a su vez genera mayor satisfacción de clientes y mejores resultados financieros.
                    </p>
                </div>
            </div>
        </div>
    )
}

// Componente Minus para la tendencia estable (si no está importado)
const Minus = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
)
