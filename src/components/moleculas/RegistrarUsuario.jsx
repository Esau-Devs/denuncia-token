
import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Eyes, EyesSlash, ShieldAlt, Upload, Camera, X, RefreshCw, Check } from "@/icons/AllIcons.tsx";



const RegistrarUsuario = () => {

    const [formData, setFormData] = useState({
        dui: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [duiImage, setDuiImage] = useState(null);
    const [faceImage, setFaceImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    // Estados para cámara
    const [showDuiCamera, setShowDuiCamera] = useState(false);
    const [showFaceCamera, setShowFaceCamera] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [facingMode, setFacingMode] = useState("user"); // "user" = frontal, "environment" = trasera
    const [serverError, setServerError] = useState('');


    const webcamRef = useRef(null);

    // Detectar si es móvil
    useState(() => {
        const checkMobile = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'dui') {
            const digits = value.replace(/\D/g, '').slice(0, 9);
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

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Subir imagen desde archivo
    const handleImageUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                setErrors(prev => ({
                    ...prev,
                    [type]: 'La imagen no debe superar los 5MB'
                }));
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'dui') {
                    setDuiImage(reader.result);
                    setErrors(prev => ({ ...prev, duiImage: '' }));
                } else {
                    setFaceImage(reader.result);
                    setErrors(prev => ({ ...prev, faceImage: '' }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Capturar foto con webcam
    const capturePhoto = useCallback((type) => {
        const imageSrc = webcamRef.current.getScreenshot();

        if (imageSrc) {
            if (type === 'dui') {
                setDuiImage(imageSrc);
                setShowDuiCamera(false);
                setErrors(prev => ({ ...prev, duiImage: '' }));
            } else {
                setFaceImage(imageSrc);
                setShowFaceCamera(false);
                setErrors(prev => ({ ...prev, faceImage: '' }));
            }
        }
    }, [webcamRef]);

    // Cambiar cámara (frontal/trasera)
    const switchCamera = () => {
        setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
    };

    const removeImage = (type) => {
        if (type === 'dui') {
            setDuiImage(null);
        } else {
            setFaceImage(null);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.dui) {
            newErrors.dui = 'El DUI es requerido';
        } else {
            const duiDigits = formData.dui.replace('-', '');
            if (duiDigits.length !== 9) {
                newErrors.dui = 'El DUI debe tener 9 dígitos';
            } else if (!/^\d{9}$/.test(duiDigits)) {
                newErrors.dui = 'El DUI solo debe contener números';
            }
        }

        if (!duiImage) {
            newErrors.duiImage = 'La foto del DUI es requerida';
        }

        if (!faceImage) {
            newErrors.faceImage = 'La foto del rostro es requerida';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // src/components/Registrar.jsx

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);

        // 1. CREAR EL OBJETO DE DATOS A ENVIAR
        const datosAEnviar = {
            dui: formData.dui,
            password: formData.password,
            duiImage: duiImage,    // La imagen en formato base64
            faceImage: faceImage,  // La imagen en formato base64
        };

        // 2. LÍNEA DE DEPURACIÓN CRÍTICA (Antes de la llamada 'fetch')
        console.log(
            "Datos enviados:", datosAEnviar,
            "Largo DUI (caracteres):", duiImage ? duiImage.length : 'NULL/CERO',
            "Largo FACE (caracteres):", faceImage ? faceImage.length : 'NULL/CERO'
        );

        try {
            const apiUrl = 'http://localhost:8000/api/auth/register';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Usamos el objeto de depuración para el body
                body: JSON.stringify(datosAEnviar),
            });

            // 3. Parsear la respuesta y manejar errores
            const data = await response.json();

            if (response.ok) {
                // ... (Lógica de éxito)
                setIsRegistered(true);
                setFormData({ dui: '', password: '', confirmPassword: '' });
                setDuiImage(null);
                setFaceImage(null);
                setErrors({});
                setServerError('');
                return;
            } else {
                // Manejo de errores
                // ...
                // 4. Registrar la respuesta de error del servidor
                console.error("Respuesta de error del backend:", data);

                if (response.status === 409 || data.detail === 'Usuario ya existe') {
                    // ... (Manejo de 409)
                } else {
                    // Aquí cae tu error 400. data.detail contendrá la causa real.
                    setServerError(data.detail || 'Error en el registro');
                }
            }
        } catch (error) {
            setServerError(error.message || 'Error de red');
        } finally {
            setIsLoading(false);
        }
    };

    // Configuración de la webcam
    const videoConstraints = {
        width: isMobile ? 1080 : 1920,
        height: isMobile ? 1920 : 1080,
        facingMode: facingMode
    };

    // Componente de cámara modal
    const CameraModal = ({ isOpen, onClose, onCapture, title, type }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">



                <div className="w-full max-w-3xl bg-white rounded-xl overflow-hidden shadow-lg h-80vh flex flex-col">
                    {/* Header */}
                    <div className="bg-[#0c3b87] text-white p-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-white  hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Cámara */}
                    <div className="relative bg-black h-80 md:h-96 flex items-center justify-center overflow-hidden">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full scale-110 sm:scale-125 md:scale-150 h-full object-cover"
                            mirrored={facingMode === "user"}
                        />

                        {/* Guías visuales */}
                        <div className="absolute inset-0 pointer-events-none">
                            {type === 'dui' ? (
                                // Guía rectangular para DUI
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="border-4 border-white border-dashed rounded-lg w-4/5 h-4/6 opacity-50"></div>
                                </div>
                            ) : (
                                // Guía circular para rostro
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="border-4 border-white border-dashed rounded-full w-72 h-72 opacity-50"></div>
                                </div>
                            )}
                        </div>

                        {/* Instrucciones */}
                        <div className="absolute top-4 left-0 right-0 text-center">
                            <p className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg inline-block text-sm">
                                {type === 'dui'
                                    ? '📄 Centra tu DUI en el recuadro'
                                    : '👤 Centra tu rostro en el círculo'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="bg-white p-4 space-y-3">
                        {/* Botones principales */}
                        <div className="flex gap-3">
                            {/* Botón Capturar */}
                            <button
                                onClick={() => onCapture(type)}
                                className="flex-1 bg-[#0c3b87] hover:bg-[#1e56a0] text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                <Camera className="w-5 h-5" />
                                Capturar Foto
                            </button>

                            {/* Botón Cambiar Cámara (solo móvil) */}
                            {isMobile && (
                                <button
                                    onClick={switchCamera}
                                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Botón Cancelar */}
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Cancelar
                        </button>

                        {/* Indicador de cámara */}
                        <p className="text-center text-sm text-gray-500">
                            Cámara: {facingMode === "user" ? "Frontal 🤳" : "Trasera 📷"}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {isRegistered && (
                <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-xs inset-shadow-sm border border-gray-200">
                    {/* Modal */}
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
                        {/* Icono de alerta */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 rounded-full p-3">
                                <Check className="w-12 h-12 text-green-600" />
                            </div>
                        </div>

                        {/* Mensaje */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Usuario registrado correctamente.
                            </h2>
                            <p className="text-gray-600">
                                ve al inicio de sesión para acceder a tu cuenta.
                            </p>
                        </div>

                        {/* Botón */}
                        <button
                            onClick={() => setIsRegistered(false)}
                            className="w-full bg-[#0c3b87] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0a2f6b] transition-colors duration-200 cursor-pointer"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}



            <div className="w-full max-w-lg space-y-8">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-[#0c3b87] rounded-full p-4 shadow-lg">
                            <ShieldAlt className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Registrarse</h1>
                        <p className="text-gray-600 mt-2">Crear una nueva cuenta en la plataforma</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                className={`w-full h-12 px-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0c3b87] focus:border-transparent ${errors.dui ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            />
                            {errors.dui && (
                                <p className="text-red-600 text-sm">{errors.dui}</p>
                            )}

                        </div>

                        {/* DUI Image Capture */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Foto del DUI
                            </label>

                            {!duiImage ? (
                                <div className="space-y-2">
                                    {/* Botón de cámara */}
                                    <button
                                        type="button"
                                        onClick={() => setShowDuiCamera(true)}
                                        className={`w-full flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg transition-all duration-200 hover:bg-blue-50 ${errors.duiImage ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'
                                            }`}
                                    >
                                        <Camera className="w-10 h-10 text-[#0c3b87] mb-2" />
                                        <p className="text-sm font-medium text-[#0c3b87]">Tomar Foto del DUI</p>
                                        <p className="text-xs text-gray-500 mt-1">📱 Usa tu cámara</p>
                                    </button>

                                    {/* Opción de subir archivo */}
                                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50">
                                        <div className="flex items-center justify-center gap-2">
                                            <Upload className="w-5 h-5 text-gray-400" />
                                            <p className="text-sm text-gray-500">O subir desde galería</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'dui')}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={duiImage}
                                        alt="DUI"
                                        className="w-full h-40 object-cover rounded-lg border-2 border-green-500"
                                    />
                                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage('dui')}
                                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {errors.duiImage && (
                                <p className="text-red-600 text-sm">{errors.duiImage}</p>
                            )}
                        </div>

                        {/* Face Image Capture */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Foto del Rostro
                            </label>

                            {!faceImage ? (
                                <div className="space-y-2">
                                    {/* Botón de cámara */}
                                    <button
                                        type="button"
                                        onClick={() => setShowFaceCamera(true)}
                                        className={`w-full flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg transition-all duration-200 hover:bg-purple-50 ${errors.faceImage ? 'border-red-300 bg-red-50' : 'border-purple-300 bg-purple-50'
                                            }`}
                                    >
                                        <Camera className="w-10 h-10 text-purple-600 mb-2" />
                                        <p className="text-sm font-medium text-purple-600">Tomar Foto del Rostro</p>
                                        <p className="text-xs text-gray-500 mt-1">🤳 Usa tu cámara</p>
                                    </button>

                                    {/* Opción de subir archivo */}
                                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50">
                                        <div className="flex items-center justify-center gap-2">
                                            <Upload className="w-5 h-5 text-gray-400" />
                                            <p className="text-sm text-gray-500">O subir desde galería</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'face')}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={faceImage}
                                        alt="Rostro"
                                        className="w-full h-40 object-cover rounded-lg border-2 border-green-500"
                                    />
                                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage('face')}
                                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {errors.faceImage && (
                                <p className="text-red-600 text-sm">{errors.faceImage}</p>
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
                                    className={`w-full h-12 px-4 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0c3b87] focus:border-transparent ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? <Eyes className="w-5 h-5" /> : <EyesSlash className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-600 text-sm">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`w-full h-12 px-4 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0c3b87] focus:border-transparent ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showConfirmPassword ? <Eyes className="w-5 h-5" /> : <EyesSlash className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-[#0c3b87] hover:bg-[#1e56a0] disabled:bg-[#1e56a0] disabled:cursor-not-allowed text-white text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Registrando...
                                </div>
                            ) : (
                                'Registrarse'
                            )}
                        </button>

                        {/* Back to Login */}

                        <a
                            href="/"
                            className="w-full h-12 p-2 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg font-semibold rounded-lg transition-all duration-200"
                        >
                            Volver al Login
                        </a>

                    </form>
                </div>
            </div>

            {/* Modales de Cámara */}
            <CameraModal
                isOpen={showDuiCamera}
                onClose={() => setShowDuiCamera(false)}
                onCapture={capturePhoto}
                title="Capturar Foto del DUI"
                type="dui"
            />

            <CameraModal
                isOpen={showFaceCamera}
                onClose={() => setShowFaceCamera(false)}
                onCapture={capturePhoto}
                title="Capturar Foto del Rostro"
                type="face"
            />
        </div>
    );
};

export default RegistrarUsuario;