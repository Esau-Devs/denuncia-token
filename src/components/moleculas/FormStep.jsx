import React, { useState } from 'react';
import { Lock, FileAlt, XS, Circule, Upload, X } from "@/icons/AllIcons.tsx";

function FormularioDenuncia({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    customCategory: '', // Nuevo campo
    location: '',
    description: '',
    evidence: [], // Array de archivos
  });

  const [errores, setErrores] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  // ============================================
  // Validación de archivos
  // ============================================
  const validateFile = (file) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];

    if (file.size > MAX_SIZE) {
      return { valid: false, error: `${file.name} excede el tamaño máximo de 10MB` };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: `${file.name} no es un tipo de archivo permitido` };
    }

    return { valid: true };
  };

  // ============================================
  // Manejo de cambios del formulario
  // ============================================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'evidence' && files) {
      const filesArray = Array.from(files);

      // Limitar a 4 archivos
      if (filesArray.length > 4) {
        alert('⚠️ Solo puedes subir un máximo de 4 archivos');
        return;
      }

      // Validar cada archivo
      const errors = [];
      const validFiles = [];

      filesArray.forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(validation.error);
        }
      });

      // Mostrar errores si los hay
      if (errors.length > 0) {
        alert('❌ Errores en los archivos:\n' + errors.join('\n'));
      }

      // Guardar solo archivos válidos
      if (validFiles.length > 0) {
        setFormData(prev => ({
          ...prev,
          evidence: validFiles
        }));
        console.log(`✅ ${validFiles.length} archivo(s) válido(s) seleccionado(s)`);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Limpiar errores
      if (errores[name]) {
        const campos = ["category", "customCategory", "description", "location"];
        if (campos.includes(name) && value.trim() !== "") {
          setErrores((prev) => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
          });
        }
      }
    }
  };

  // Función para remover un archivo específico
  const removeFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, index) => index !== indexToRemove)
    }));
  };

  // ============================================
  // Validación de pasos
  // ============================================
  const validarPasoActual = () => {
    const nuevosErrores = {};

    if (step === 1) {
      if (!formData.category.trim()) {
        nuevosErrores.category = "Debe seleccionar una categoría.";
      }

      // Validar campo personalizado si se seleccionó "otro"
      if (formData.category === 'otro' && !formData.customCategory.trim()) {
        nuevosErrores.customCategory = "Debe especificar el tipo de denuncia.";
      }

      if (!formData.location.trim()) {
        nuevosErrores.location = "Debe ingresar una ubicación.";
      }
    }

    if (step === 2 && !formData.description.trim()) {
      nuevosErrores.description = "Debe ingresar una descripción.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const nextStep = () => {
    if (validarPasoActual()) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  // ============================================
  // Envío del formulario (TODO EN UNO)
  // ============================================
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Determinar la categoría final
      const finalCategory = formData.category === 'otro'
        ? formData.customCategory
        : formData.category;

      // Crear FormData para enviar archivos + datos
      const formDataToSend = new FormData();

      // Agregar datos de la denuncia
      formDataToSend.append('category', finalCategory);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);

      // Agregar archivos (si hay)
      if (formData.evidence && formData.evidence.length > 0) {
        formData.evidence.forEach((file, index) => {
          formDataToSend.append('files', file);
        });
      }

      console.log("=".repeat(60));
      console.log("🔍 ENVIANDO DENUNCIA:");
      console.log("Category:", finalCategory);
      console.log("Location:", formData.location);
      console.log("Description:", formData.description);
      console.log("Files:", formData.evidence.length, "archivo(s)");
      console.log("=".repeat(60));

      const response = await fetch(`/api/denuncias/crear`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend, // FormData, NO JSON
        // NO incluir Content-Type, el navegador lo configura automáticamente con boundary
      });

      const data = await response.json();

      console.log("📥 Respuesta del servidor:", data);
      console.log("📥 Status:", response.status);

      if (!response.ok) {
        console.error('❌ Error del servidor:', data);
        throw new Error(data.detail || 'Error desconocido');
      }

      console.log('✅ Denuncia guardada correctamente:', data);

      // Mostrar modal de éxito
      setModalVisible(true);

      // Resetear formulario
      setFormData({
        category: '',
        customCategory: '',
        location: '',
        description: '',
        evidence: [],
      });
      setStep(1);

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setModalVisible(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error("❌ Error completo:", error);
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setErrores({});
    setFormData({
      category: '',
      customCategory: '',
      location: '',
      description: '',
      evidence: [],
    });
    onClose();
  };

  if (!isOpen) return null;

  // Determinar la categoría a mostrar en el resumen
  const displayCategory = formData.category === 'otro'
    ? formData.customCategory
    : formData.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xs p-4">
      {modalVisible && (
        <article className="fixed right-5 top-24 bg-white border-l-4 border-green-600 shadow-lg rounded-md p-4 w-72 z-50 animate-fade-in-up">
          <div className="text-green-700 font-bold mb-1">¡Éxito!</div>
          <p className="text-sm text-gray-700">
            ¡Denuncia enviada y almacenada correctamente!
          </p>
        </article>
      )}

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-50 rounded-lg">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-900 border-t-transparent mb-3"></div>
          <p className="text-blue-900 font-medium">Enviando denuncia...</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-bold text-xl">Formulario de denuncias</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            type="button"
          >
            <XS className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="relative w-full sm:flex items-center justify-between px-4 mb-8 hidden">
            {['Información Básica', 'Detalles', 'Evidencia', 'Revisar y Enviar'].map((label, index) => {
              const stepIndex = index + 1;
              const isCompleted = step > stepIndex;
              const isCurrent = step === stepIndex;
              return (
                <div key={index} className="relative flex-1 flex flex-col items-center text-center">
                  {index < 3 && (
                    <div className={`absolute top-2.5 left-1/2 w-full h-0.5 z-0 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                  <div className={`relative z-10 w-5 h-5 rounded-full border-4 transition-all duration-300 ${isCompleted ? 'border-green-500 bg-white' :
                    isCurrent ? 'border-blue-900 bg-blue-900' :
                      'border-gray-300 bg-white'
                    }`} />
                  <span className="mt-2 text-sm font-medium text-blue-900">{label}</span>
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <article>
              <div className="mb-4">
                <label htmlFor="category" className="block font-semibold mb-1">Categoría:</label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Seleccione una categoría</option>
                  <option value="corrupcion">Corrupción</option>
                  <option value="abuso">Abuso de Poder</option>
                  <option value="violencia">Violencia</option>
                  <option value="fraude">Fraude</option>
                  <option value="narcotrafico">Narcotráfico</option>
                  <option value="otro">Otro</option>
                </select>
                {errores.category && <p className="text-red-500 text-sm mt-1">{errores.category}</p>}
              </div>

              {/* Campo adicional cuando se selecciona "Otro" */}
              {formData.category === 'otro' && (
                <div className="mb-4 animate-fade-in">
                  <label htmlFor="customCategory" className="block font-semibold mb-1">
                    Especifique la categoría:
                  </label>
                  <input
                    type="text"
                    id="customCategory"
                    name="customCategory"
                    value={formData.customCategory}
                    onChange={handleChange}
                    placeholder="Escriba el tipo de denuncia"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                  />
                  {errores.customCategory && (
                    <p className="text-red-500 text-sm mt-1">{errores.customCategory}</p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="location" className="block font-semibold mb-1">Ubicación:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Lugar donde ocurrieron los hechos"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                {errores.location && <p className="text-red-500 text-sm mt-1">{errores.location}</p>}
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={nextStep} className="px-5 py-2 rounded font-medium shadow-sm bg-blue-900 text-white hover:bg-blue-800 cursor-pointer">
                  Siguiente
                </button>
              </div>
            </article>
          )}

          {step === 2 && (
            <article>
              <div className="mb-4">
                <label htmlFor="description" className="block font-semibold mb-1">Descripción Detallada:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
                  placeholder="Describa todos los detalles relevantes de su denuncia..."
                />
                {errores.description && <p className="text-red-500 text-sm mt-1">{errores.description}</p>}
              </div>

              <div className="flex justify-between flex-col sm:flex-row">
                <button type="button" onClick={prevStep} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 mb-2 sm:mb-0 cursor-pointer">
                  Anterior
                </button>
                <button type="button" onClick={nextStep} className="px-4 py-2 rounded bg-blue-900 text-white hover:bg-blue-800 cursor-pointer">
                  Siguiente
                </button>
              </div>
            </article>
          )}

          {step === 3 && (
            <article>
              <div className="mb-6">
                <label htmlFor="evidence" className="block text-sm font-medium text-gray-800 mb-2">
                  Evidencia <span className="text-gray-500">(opcional - máx. 4 archivos)</span>
                </label>

                {/* Zona de drop */}
                <div className="relative flex-col text-center justify-center bg-white border-2 border-dashed border-gray-300 hover:border-blue-900 rounded-lg shadow-sm px-4 py-3 transition hover:shadow-md">
                  <input
                    type="file"
                    id="evidence"
                    name="evidence"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,audio/*"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                  />
                  <div className="flex justify-center py-3 w-full flex-col items-center pointer-events-none">
                    <Upload className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-gray-600 text-sm">
                      {formData.evidence.length > 0
                        ? `${formData.evidence.length} archivo(s) seleccionado(s) - Click para cambiar`
                        : 'Seleccionar hasta 4 archivos...'}
                    </span>
                  </div>
                </div>

                {/* Lista de archivos seleccionados */}
                {formData.evidence.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.evidence.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-900 transition-colors"
                      >
                        <FileAlt className="w-5 h-5 text-blue-900 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Eliminar archivo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Formatos permitidos: imágenes (JPG, PNG, GIF, WebP), PDF, Word, audio (MP3, WAV, OGG) - Máx. 10MB por archivo
                </p>
              </div>

              <div className="flex justify-between flex-col sm:flex-row">
                <button type="button" onClick={prevStep} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 mb-2 sm:mb-0 cursor-pointer">
                  Anterior
                </button>
                <button type="button" onClick={nextStep} className="px-4 py-2 rounded bg-blue-900 text-white hover:bg-blue-800 cursor-pointer">
                  Revisar
                </button>
              </div>
            </article>
          )}

          {step === 4 && (
            <article>
              <div className="mb-6 bg-gray-50 shadow-lg rounded-lg p-4 text-base">
                <h4 className="text-lg font-bold text-blue-900">Resumen de su denuncia</h4>
                <div className="text-sm space-y-3 mt-3 text-gray-700">
                  <div>
                    <strong>Categoría:</strong> {displayCategory || 'No especificada'}
                  </div>
                  <div><strong>Ubicación:</strong> {formData.location || 'No proporcionada'}</div>
                  <div><strong>Descripción:</strong>
                    <p className='bg-gray-100 rounded-sm p-3'>
                      {formData.description}
                    </p>
                  </div>
                  <div>
                    <strong>Evidencias:</strong>
                    {formData.evidence?.length ? (
                      <div className="mt-2 space-y-1">
                        {formData.evidence.map((file, index) => (
                          <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-2">
                            <FileAlt className="w-4 h-4 text-blue-900" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500"> No adjuntada</span>
                    )}
                  </div>
                </div>
                <p className='bg-red-100 rounded-sm p-3 text-gray-800 mt-3 flex flex-col sm:flex-row gap-3 items-center'>
                  <Lock className='w-5 h-5 text-red-500 flex-shrink-0' />
                  La información proporcionada es confidencial y será tratada según los protocolos de seguridad establecidos.
                </p>
              </div>

              <div className="flex justify-between flex-col sm:flex-row">
                <button type="button" onClick={prevStep} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 mb-2 sm:mb-0 cursor-pointer">
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-blue-900 text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Denuncia'}
                </button>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-white transition-all p-6 rounded-xl shadow-md hover:shadow-xl border-2 border-gray-200 cursor-pointer w-full"
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-slate-700 to-blue-900 p-4 rounded-lg">
            <Circule className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-lg mb-1">
              Nueva Denuncia
            </h4>
            <p className="text-sm text-gray-600">
              Reporta un problema
            </p>
          </div>
        </div>
      </button>

      <FormularioDenuncia
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default App;