
import { useState } from "react";
import { Eyes, ShieldAlt, EyesSlash, AlertTriangle } from "@/icons/AllIcons.tsx";


export default function Login() {



    const [formData, setFormData] = useState({
        dui: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isMessageAuthenticated, setIsMessageAuthenticated] = useState(false);




    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Format DUI input
        if (name === 'dui') {
            // Remove all non-digits and limit to 9 digits
            const digits = value.replace(/\D/g, '').slice(0, 9);
            // Format as XXXXXXXX-X
            let formattedDui = digits;
            if (digits.length > 8) {
                formattedDui = digits.slice(0, 8) + '-' + digits.slice(8);
            }
            setFormData(prev => ({
                ...prev,
                [name]: formattedDui
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.dui) {
            newErrors.dui = 'El DUI es requerido';
        } else {
            // Remove dash for validation
            const duiDigits = formData.dui.replace('-', '');
            if (duiDigits.length !== 9) {
                newErrors.dui = 'El DUI debe tener 9 dígitos';
            } else if (!/^\d{9}$/.test(duiDigits)) {
                newErrors.dui = 'El DUI solo debe contener números';
            }
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // src/components/moleculas/Login.jsx (Función handleSubmit corregida)

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setMessage('Por favor, rellena todos los campos requeridos.', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const apiUrl = 'http://localhost:8000/api/auth/login';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dui: formData.dui,
                    password: formData.password,
                }),
                // Esencial para enviar/recibir la cookie HttpOnly
                credentials: 'include',
            });

            if (response.ok) {
                /*  alert('¡Login exitoso! Bienvenido a la plataforma.', 'success'); */

                // 🔑 CAMBIO CRUCIAL: Reemplazar navigate() por window.location.href
                // 🔑 Añadir la verificación de 'window' para evitar el error de SSR de Astro
                if (typeof window !== 'undefined') {
                    window.location.href = '/home';
                }

            } else {

                const data = await response.json();
                console.log('Respuesta de error del servidor:', data);
                if (response.status === 401 || data.detail === 'Credenciales inválidas') {
                    setIsMessageAuthenticated(true);


                    setTimeout(() => {
                        setFormData({ dui: '', password: '' });
                        setErrors({});

                    }, 3000);

                }


            }

        } catch (error) {
            console.error('Error en login:', error);



        } finally {
            setIsLoading(false);
        }
    };


    return (


        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {isMessageAuthenticated && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-xs inset-shadow-sm border border-gray-200 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-center mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-red-600" />
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                                Error de autenticación
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                Usuario o contraseña incorrectos
                            </p>
                        </div>

                        <button
                            onClick={() => setIsMessageAuthenticated(false)}
                            className="w-full bg-[#0c3b87] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0a2f6b] transition-colors duration-200 cursor-pointer"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="text-center space-y-3 sm:space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-[#0c3b87] rounded-full p-3 sm:p-4 shadow-lg">
                            <ShieldAlt className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Denuncias Ciudadanas
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-2 px-4 text-balanced">
                            Plataforma oficial para reportar incidencias ciudadanas
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-5 sm:p-6">
                    <div className="space-y-1 mb-5 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-900">
                            Iniciar Sesión
                        </h2>
                        <p className="text-sm sm:text-base text-center text-gray-600 px-2">
                            Ingresa tu DUI y contraseña para acceder
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* DUI Field */}
                        <div className="space-y-2">
                            <label htmlFor="dui" className="text-sm font-medium text-gray-700">
                                Número de DUI
                            </label>
                            <input
                                id="dui"
                                name="dui"
                                type="text"
                                placeholder="12345678-9"
                                value={formData.dui}
                                onChange={handleInputChange}
                                maxLength="10"
                                className={`w-full h-11 sm:h-12 px-4 text-sm sm:text-base rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0c3b87] focus:border-transparent ${errors.dui
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                required
                            />
                            {errors.dui && (
                                <div className="flex items-center gap-1 text-red-600 text-xs sm:text-sm">
                                    <span>{errors.dui}</span>
                                </div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full h-11 sm:h-12 px-4 pr-12 text-sm sm:text-base rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0c3b87] focus:border-transparent ${errors.password
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? (
                                        <Eyes className="w-5 h-5" />
                                    ) : (
                                        <EyesSlash className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <div className="flex items-center gap-1 text-red-600 text-xs sm:text-sm">
                                    <span>{errors.password}</span>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full h-11 sm:h-12 bg-[#0c3b87] hover:bg-[#1e56a0] disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm sm:text-base">Iniciando sesión...</span>
                                </div>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </div>

                    <div className="mt-5 sm:mt-6 text-center">
                        <p className="text-xs sm:text-sm text-gray-600">
                            ¿No tienes cuenta?{" "}
                            <a
                                className="text-[#0c3b87] hover:text-[#1e56a0] hover:underline font-medium transition-colors cursor-pointer"
                                href="/registrar"
                            >
                                Registrarse
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 px-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span>Servicio ciudadano oficial</span>
                    </div>
                    <p>Protegemos tu privacidad y datos personales</p>
                </div>
            </div>
        </div>
    );
}