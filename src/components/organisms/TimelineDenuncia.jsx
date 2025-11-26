import React, { useState, useEffect } from 'react';

// --- COMPONENTE: TIMELINE VIEWER (CON SOPORTE PARA ADMIN) ---
export const TimelineViewer = ({ denunciaId, isAdmin = false }) => {
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener URL del backend desde variable de entorno
    const API_URL = 'https://backend-api-638220759621.us-west1.run.app';

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                setLoading(true);
                setError(null);

                // Si es admin, usa el endpoint sin verificación de ownership
                const endpoint = isAdmin
                    ? `${API_URL}/timeline/todas/${denunciaId}`
                    : `${API_URL}/timeline/${denunciaId}`;

                console.log('🔍 Fetching timeline desde:', endpoint);
                console.log('👤 Modo admin:', isAdmin);

                const response = await fetch(endpoint, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('📡 Response status:', response.status);

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('No autorizado. Verifica tu sesión.');
                    }
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                setTimelineData(data);
                console.log(`✅ Timeline cargado: ${data.length} entrada(s)`);
            } catch (err) {
                console.error('❌ Error al cargar timeline:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (denunciaId) {
            fetchTimeline();
        }
    }, [denunciaId, API_URL, isAdmin]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Cargando timeline...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600">
                <p className="text-sm font-semibold mb-2">⚠️ Error al cargar timeline</p>
                <p className="text-xs">{error}</p>
            </div>
        );
    }

    if (timelineData.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                <p className="text-sm">No hay actualizaciones disponibles para esta denuncia.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="relative">
                {/* Línea vertical del timeline */}
                <div className="absolute left-4 top-6 bottom-0 w-px bg-gray-300"></div>

                {/* Entradas del timeline */}
                <div className="space-y-4">
                    {timelineData.map((entry, index) => {
                        const isLast = index === timelineData.length - 1;

                        return (
                            <div key={entry.id} className="relative pl-12">
                                {/* Punto indicador */}
                                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${isLast ? 'bg-gray-700 border-gray-700' : 'bg-white border-gray-300'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${isLast ? 'bg-white' : 'bg-gray-400'}`}></div>
                                </div>

                                {/* Tarjeta de contenido */}
                                <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${isLast ? 'ring-2 ring-gray-300' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-900 text-sm">
                                            {entry.titulo}
                                        </h4>
                                        {isLast && (
                                            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded font-semibold">
                                                Reciente
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                        {entry.descripcion}
                                    </p>

                                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                                        <div className="bg-white rounded p-2 mb-3 text-xs border border-gray-200">
                                            {Object.entries(entry.metadata).map(([key, value]) => (
                                                <div key={key} className="flex gap-2">
                                                    <span className="font-semibold text-gray-500 capitalize">{key}:</span>
                                                    <span className="text-gray-700">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-2 border-t border-gray-200">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="font-medium">{entry.nombre_actualizador}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatDate(entry.fecha_actualizacion)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


        </div>
    );
};