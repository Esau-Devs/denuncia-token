import React, { useEffect } from 'react' // ✅ IMPORTAR useEffect
import { useFetchDenuncias } from '../../hooks/useFetchDenuncias';

export const BentoOne = () => {
    const [datosUsuario, setDatosUsuario] = React.useState([]);
    const { denuncias } = useFetchDenuncias();
    const totalResueltas = denuncias.filter(d => d.estado === "resuelta").length;
    const totalPendientes = denuncias.filter(d => d.estado === "pendiente").length;
    const totalEnProceso = denuncias.filter(d => d.estado === "en_proceso").length;

    useEffect(() => {


        const fetchDatosUsuario = async () => {
            try {
                const apiUrl = '/api/usuario/me';
                console.log(`📤 [USER INFO] Petición a: ${apiUrl}`);

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'same-origin',
                });



                // Intentar leer la respuesta como texto primero
                const responseText = await response.text();


                if (!response.ok) {


                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                // Intentar parsear el JSON
                let data;
                try {
                    data = responseText ? JSON.parse(responseText) : {};

                } catch (parseError) {

                    throw new Error('Respuesta del servidor no es JSON válido');
                }

                setDatosUsuario(data);


            } catch (error) {

                console.error('   Error:', error instanceof Error ? error.message : String(error));
                console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');

            }
        };

        fetchDatosUsuario();
    }, []);

    const handleLogout = async () => {


        try {
            const apiUrl = '/api/auth/logout';


            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                redirect: 'manual',
                credentials: 'same-origin',
            });



            if (response.type === 'opaqueredirect' || response.status === 0 || response.status === 302) {


                setTimeout(() => {
                    window.location.href = '/';
                }, 100);
                return;
            }



            setTimeout(() => {
                window.location.href = '/';
            }, 100);

        } catch (err) {

            console.error('   Error:', err instanceof Error ? err.message : String(err));



            setTimeout(() => {
                window.location.href = '/';
            }, 100);
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
                    <span className="text-white text-2xl font-bold">
                        {datosUsuario?.nombre_completo ? datosUsuario.nombre_completo.substring(0, 2).toUpperCase() : 'NB'}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {datosUsuario?.nombre_completo || 'Cargando...'}
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                            Activo
                        </span>
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
                    <span className="text-gray-600">{datosUsuario?.dui || 'Cargando...'}</span>
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
                        <span className="font-medium">Género:</span>
                        <span className="text-gray-600">{datosUsuario?.genero || 'Cargando...'}</span>
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
                        <span className="text-gray-600">
                            {datosUsuario?.fecha_registro
                                ? new Date(datosUsuario.fecha_registro).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })
                                : 'Cargando...'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 grid md:grid-cols-2 grid-cols-1 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent">
                        {denuncias.length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Total Denuncias</p>
                </div>
                <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                    <p className="text-3xl font-bold text-gray-600">{totalResueltas}</p>
                    <p className="text-xs text-gray-500 mt-1">Resueltas</p>
                </div>
                <div className="text-center p-3 bg-[#e8f0fe] rounded-lg">
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent">
                        {totalPendientes}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Pendientes</p>
                </div>
                <div className="text-center p-3 bg-[#e8f0fe] rounded-lg">
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent">
                        {totalEnProceso}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">En Proceso</p>
                </div>
            </div>

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