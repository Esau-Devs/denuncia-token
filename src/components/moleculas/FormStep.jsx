import React, { useState } from 'react';
import { Lock, FileAlt, XS, Circule, Upload } from "@/icons/AllIcons.tsx";

function FormularioDenuncia({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); // ✅ nuevo estado de carga

  const [formData, setFormData] = useState({
    category: '',
    location: '',
    description: '',
    evidence: null,
  });

  const [errores, setErrores] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? Array.from(files) : value,
    });

    if (errores[name]) {
      const campos = ["category", "description", "location"]
      if (campos.includes(name) && value.trim() !== "") {
        setErrores((prev) => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
      }
    }
  };

  const validarPasoActual = () => {
    const nuevosErrores = {};
    if (step === 1 && !formData.category.trim()) {
      nuevosErrores.category = "Debe seleccionar una categoría.";
    }
    if (step === 1 && !formData.location.trim()) {
      nuevosErrores.location = "Debe seleccionar una ubicacion.";
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

  const handleSubmit = async () => {
    try {
      setLoading(true); // ✅ iniciar carga

      const nuevaDenuncia = {
        category: formData.category,
        location: formData.location,
        description: formData.description,
        evidence: formData.evidence,
      };

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/denuncias/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaDenuncia),
      });

      if (!response.ok) throw new Error('Error al enviar denuncia');

      console.log('Denuncia guardada correctamente');
      setModalVisible(true);

      setFormData({
        category: '',
        location: '',
        description: '',
        evidence: [],
      });

      setStep(1);
      setLoading(false); // ✅ detener carga
    } catch (error) {
      console.error("Error al guardar la denuncia:", error);
      setLoading(false); // detener carga en caso de error
    }
  };

  const handleClose = () => {
    setStep(1);
    setErrores({});
    onClose();
  };

  if (!isOpen) return null;

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
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Describa todos los detalles relevantes de su denuncia..."
                />
                {errores.description && <p className="text-red-500 text-sm mt-1">{errores.description}</p>}
              </div>

              <div className="flex justify-between flex-col sm:flex-row ">
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
                  Evidencia <span className="text-gray-500">(opcional)</span>
                </label>
                <div className="relative flex-col text-center justify-center bg-white border-2 border-dashed border-gray-300 hover:border-blue-900 rounded-lg shadow-sm px-4 py-3 transition hover:shadow-md">
                  <input
                    type="file"
                    id="evidence"
                    name="evidence"
                    multiple
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex justify-center py-3 w-full flex-col items-center">
                    {(!formData.evidence || formData.evidence.length === 0) ? (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-gray-600 text-sm">Seleccionar múltiples archivos...</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-600 flex flex-row gap-2 items-center text-center">
                        <FileAlt className="w-5 h-5" />
                        {formData.evidence.length} archivo{formData.evidence.length > 1 ? 's' : ''} seleccionado{formData.evidence.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formatos permitidos: imágenes, documentos, audio (máx. 10MB)
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
                  <div><strong>Categoría:</strong> {formData.category}</div>
                  <div><strong>Ubicación:</strong> {formData.location || 'No proporcionada'}</div>
                  <div><strong>Descripción:</strong>
                    <p className='bg-gray-100 rounded-sm p-3'>
                      {formData.description}
                    </p>
                  </div>
                  <div><strong>Evidencias:</strong> {formData.evidence?.length ? `${formData.evidence.length} archivo(s)` : 'No adjuntada'}</div>
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
                <button type="button" onClick={handleSubmit} className="px-4 py-2 rounded bg-blue-900 text-white hover:bg-blue-800 cursor-pointer">
                  Enviar Denuncia
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
        className="bg-white transition-all p-6 rounded-xl shadow-md hover:shadow-xl border-2 border-gray-200 cursor-pointer w-full "
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
        id="usuario-123"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default App;