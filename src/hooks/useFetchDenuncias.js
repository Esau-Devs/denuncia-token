import { useState, useEffect } from "react";

export function useFetchDenuncias() {
    const [denuncias, setDenuncias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDenuncias = async () => {
            try {
                setLoading(true);

                console.log('✅ Haciendo petición a API con cookies...');

                const response = await fetch(`/api/denuncias/mis-denuncias`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'same-origin', // 🔥 Envía cookies automáticamente
                });

                console.log('📡 Respuesta del servidor:', response.status);

                if (!response.ok) {
                    if (response.status === 401) {
                        console.error('❌ No autenticado - redirigiendo al login...');
                        window.location.href = '/login';
                        return;
                    }
                    throw new Error('Error al obtener las denuncias');
                }

                const data = await response.json();
                console.log('✅ Denuncias obtenidas:', data.length);
                setDenuncias(data);
            } catch (err) {
                console.error('💥 Error en fetchDenuncias:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDenuncias();
    }, []);

    return { denuncias, loading, error };
}
