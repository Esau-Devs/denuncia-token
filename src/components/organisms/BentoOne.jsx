import React from 'react'
/* import { useNavigate } from 'react-router-dom'; */

export const BentoOne = () => {

    /*  const navigate = useNavigate(); */



    const handleLogout = async () => {


        try {
            const URLBACKEND = 'https://backend-api-638220759621.us-central1.run.app';
            // El endpoint de logout en tu FastAPI
            const apiUrl = `${URLBACKEND}/api/auth/logout`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                // CRUCIAL: 'include' es necesario para que el navegador adjunte 
                // la cookie HttpOnly al hacer la petición al backend.
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {


                // 🔑 Redirección obligatoria tras cerrar sesión
                // Verificamos el entorno para evitar errores de SSR en Astro
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
            } else {
                const data = await response.json();
                setError(data.message || 'Error al cerrar sesión en el servidor.');
            }

        } catch (err) {
            console.error('Error de red durante el logout:', err);
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div
            className="col-span-2 lg:col-span-1 md:row-span-2 bg-white shadow-lg rounded-xl p-6 md:p-8 hover:shadow-xl transition-shadow"
        >
            <div className="flex items-start gap-4 mb-6">
                <div
                    className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-[#2a3b5d] to-[#0c3b87] flex items-center justify-center flex-shrink-0"
                >
                    <span className="text-white text-2xl font-bold">MG</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h2
                        className="text-xl font-semibold text-gray-900 mb-2"
                    >
                        María González
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                        <span
                            className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">Activo</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                    </svg>
                    <span className="font-medium">ID:</span>
                    <span className="text-gray-600">01482303-1</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                    </svg>
                    <div className="lex lg:flex-row gap-2">
                        <span className="font-medium">Teléfono:</span>
                        <span className="text-gray-600"
                        >+34 612 345 678</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                    </svg>
                    <div className="flex lg:flex-row gap-2">
                        <span className="font-medium">Miembro desde:</span>
                        <span className="text-gray-600"> Enero 2024</span>
                    </div>
                </div>
            </div>

            <div
                className="mt-6 pt-6 border-t border-gray-200 grid md:grid-cols-2 grid-cols-1 gap-4"
            >
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p
                        className="text-3xl font-bold bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent"
                    >
                        12
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        Total Denuncias
                    </p>
                </div>
                <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                    <p className="text-3xl font-bold text-gray-600">8</p>
                    <p className="text-xs text-gray-500 mt-1">Resueltas</p>
                </div>
                <div className="text-center p-3 bg-[#e8f0fe] rounded-lg">
                    <p
                        className="text-3xl font-bold bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent"
                    >
                        3
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Pendientes</p>
                </div>
                <div className="text-center p-3 bg-[#e8f0fe] rounded-lg">
                    <p
                        className="text-3xl font-bold bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent">
                        1
                    </p>
                    <p className="text-xs text-gray-500 mt-1">En Proceso</p>
                </div>
            </div>

            {/* Botón de cerrar sesión */}
            <div className="flex justify-center mt-4">
                <button
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-[#2a3b5d] hover:to-[#0c3b87] hover:text-white transition-all duration-300 cursor-pointer"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        ></path>
                    </svg>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </div>
    )
}
