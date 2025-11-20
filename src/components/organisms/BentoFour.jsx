import React, { useState, useEffect } from 'react';
import { useFetchDenuncias } from '../../hooks/useFetchDenuncias';


export const BentoFour = () => {
    const { denuncias, loading, error } = useFetchDenuncias();
    const [selectedDenuncia, setSelectedDenuncia] = useState(null);



    const getEstadoStyle = (estado) => {
        const styles = {
            pendiente: {
                bg: 'bg-[#e8f0fe]',
                border: 'border-[#1a73e8]',
                badge: 'border-[#0c3b87] bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent',
                dot: 'bg-[#1a73e8]',
            },
            'en_proceso': {
                bg: 'bg-[#e8f0fe]',
                border: 'border-[#1a73e8]',
                badge: 'border-[#0c3b87] bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent',
                dot: 'bg-[#1a73e8] animate-pulse',
            },
            resuelta: {
                bg: 'bg-[#f8f9fa]',
                border: 'border-gray-400',
                badge: 'text-gray-600 bg-[#f8f9fa] border-gray-400',
                dot: null,
            },
        };
        return styles[estado?.toLowerCase()] || styles.pendiente;
    };
    const statusMap = {
        pendiente: 'Pendiente',
        en_proceso: 'En proceso',
        resuelta: 'Resuelta'
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-SV', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    if (loading) {
        return (
            <div className="col-span-2 lg:col-span-1 rounded-xl p-6 bg-white border border-gray-200 shadow-lg">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a73e8]"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="col-span-2 lg:col-span-1 rounded-xl p-6 bg-white border border-gray-200 shadow-lg">
                <div className="text-center text-red-600 p-4">
                    <p className="text-lg font-semibold mb-2">⚠️ Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/*max-h-[500px] overflow-hidden flex flex-col*/}
            <div className="col-span-2 lg:col-span-1 rounded-xl p-6 bg-white border border-gray-200 shadow-lg max-h-[500px] overflow-hidden flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    Mis Denuncias
                </h3>

                {denuncias.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <svg
                            className="w-16 h-16 mx-auto mb-4 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p className="text-lg font-medium">No tienes denuncias aún</p>
                        <p className="text-sm mt-2">Crea tu primera denuncia para comenzar</p>
                    </div>
                ) : (

                    <div className="space-y-3 overflow-y-auto"> {/*max-h-[500px]*/}
                        {denuncias.map((denuncia) => {
                            const estilo = getEstadoStyle(statusMap[denuncia.estado]);
                            return (
                                <div
                                    key={denuncia.id}
                                    onClick={() => setSelectedDenuncia(denuncia)}
                                    className={`p-4 rounded-lg ${estilo.bg} border-l-4 ${estilo.border} hover:shadow-md transition-shadow cursor-pointer`}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h4 className="text-sm font-semibold text-gray-900 flex-1">
                                            {truncateText(denuncia.descripcion, 60)}
                                        </h4>
                                        <span
                                            className={`inline-flex items-center ${estilo.badge} text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap border`}
                                        >
                                            {estilo.dot && (
                                                <span className={`w-2 h-2 ${estilo.dot} rounded-full mr-1`}></span>
                                            )}
                                            {denuncia.estado === 'resuelta' && (
                                                <svg
                                                    className="h-3 w-3 mr-1"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                            {denuncia.estado.charAt(0).toUpperCase() + denuncia.estado.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500">
                                            {formatDate(denuncia.fecha_creacion)}
                                        </p>
                                        <p className="text-xs text-gray-600 font-medium">
                                            {denuncia.categoria}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal para ver detalles */}
            {selectedDenuncia && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xs p-4 "
                    onClick={() => setSelectedDenuncia(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Detalles de la Denuncia</h2>
                            <button
                                onClick={() => setSelectedDenuncia(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Estado */}
                            <div className="flex items-center justify-between pb-4 border-b">
                                <div>
                                    <p className="text-sm text-gray-500">Estado</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">
                                        {selectedDenuncia.estado}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Fecha</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {formatDate(selectedDenuncia.fecha_creacion)}
                                    </p>
                                </div>
                            </div>

                            {/* Categoría */}
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Categoría</p>
                                <div className="inline-flex items-center bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full text-sm font-medium">
                                    {selectedDenuncia.categoria}
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Ubicación</p>
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-gray-900">{selectedDenuncia.ubicacion}</p>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Descripción</p>
                                <p className="text-gray-900 leading-relaxed">{selectedDenuncia.descripcion}</p>
                            </div>

                            {/* Evidencias */}
                            {Array.isArray(selectedDenuncia.evidencias) && selectedDenuncia.evidencias.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-3">Evidencias ({selectedDenuncia.evidencias.length})</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedDenuncia.evidencias.map((url, index) => {
                                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                                            const isPDF = /\.pdf$/i.test(url);
                                            const isAudio = /\.(mp3|wav|ogg)$/i.test(url);

                                            return (
                                                <div key={index} className="relative group">
                                                    {isImage ? (
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                                                            <img
                                                                src={url}
                                                                alt={`Evidencia ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-75 transition-opacity"
                                                            />
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                                        >
                                                            {isPDF ? (
                                                                <svg className="w-12 h-12 text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : isAudio ? (
                                                                <svg className="w-12 h-12 text-blue-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-12 h-12 text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                            <p className="text-xs text-gray-600 font-medium">
                                                                {isPDF ? 'Documento PDF' : isAudio ? 'Audio' : 'Archivo'}
                                                            </p>
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ID de seguimiento */}
                            <div className="pt-4 border-t">
                                <p className="text-xs text-gray-500">ID de seguimiento</p>
                                <p className="text-xs font-mono text-gray-600 break-all">{selectedDenuncia.id}</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedDenuncia(null)}
                                className="w-full bg-[#1a73e8] text-white py-2 px-4 rounded-lg hover:bg-[#1557b0] transition-colors font-medium cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}