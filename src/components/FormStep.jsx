import React, { useState } from 'react';
import { Lock, Upload, FileAlt } from "../icons/AllIcons.js";

function FormularioDenuncia({ id }) {
  const [step, setStep] = useState(1);
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
      if (
        (name === "category" && value.trim() !== "") ||
        (name === "description" && value.trim() !== "")
      ) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      const denunciaId = `denuncia-${Date.now()}`;
      const denunciasGuardadas = JSON.parse(localStorage.getItem("denuncias")) || [];

      const nuevaDenuncia = {
        id: denunciaId,
        token: id, // Asociar con codigo de usuario
        ...formData,
        fecha: new Date().toISOString(),
      };

      localStorage.setItem("denuncias", JSON.stringify([...denunciasGuardadas, nuevaDenuncia]));

      setFormData({
        category: '',
        location: '',
        description: '',
        evidence: [],
      });

      setStep(1);
      setModalVisible(true);
      setTimeout(() => setModalVisible(false), 3000);
    } catch (error) {
      console.error("Error al guardar la denuncia en localStorage:", error);
    }
  };

  return (
    <div className='mt-8 mb-8'>
      {/* Modal toast */}
      {modalVisible && (
        <div className="fixed right-5 top-24 bg-white border-l-4 border-green-600 shadow-lg rounded-md p-4 w-72 z-50 animate-fade-in-up">
          <div className="text-green-700 font-bold mb-1">¡Exito!</div>
          <p className="text-sm text-gray-700">
            ¡Denuncia enviada y almacenada correctamente!
          </p>
        </div>
      )}

      <nav className="p-6 bg-[#f7fafc]">
        <h3 className="font-bold text-xl">Formulario de denuncias</h3>
      </nav>

      <form onSubmit={handleSubmit} className="p-6 rounded-lg text-gray-700">
        {/* Progreso visual */}
        <div className="relative w-full sm:flex items-center justify-between px-4 mb-8 hidden sm:hidden-none">
          {['Información Básica', 'Detalles', 'Evidencia', 'Revisar y Enviar'].map((label, index) => {
            const stepIndex = index + 1;
            const isCompleted = step > stepIndex;
            const isCurrent = step === stepIndex;
            return (
              <div key={index} className="relative flex-1 flex flex-col items-center text-center">
                {index < 3 && (
                  <div className={`absolute top-2.5 left-1/2 w-full h-0.5 z-0 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
                <div className={`relative z-10 w-5 h-5 rounded-full border-4 transition-all duration-300 ${
                  isCompleted ? 'border-green-500 bg-white' :
                  isCurrent ? 'border-[#0c3b87] bg-[#0c3b87]' :
                  'border-gray-300 bg-white'
                }`} />
                <span className="mt-2 text-sm font-medium text-[#0c3b87]">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Paso 1 */}
        {step === 1 && (
          <div>
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
                <option value="">Seleccione una categoria</option>
                <option value="corrupcion">Corrupcion</option>
                <option value="abuso">Abuso de Poder</option>
                <option value="violencia">Violencia</option>
                <option value="fraude">Fraude</option>
                <option value="narcotrafico">Narcotrafico</option>
                <option value="otro">Otro</option>
              </select>
              {errores.category && <p className="text-red-500 text-sm mt-1">{errores.category}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="location" className="block font-semibold mb-1">Ubicacion (opcional):</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Lugar donde ocurrieron los hechos"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={nextStep} className="px-5 py-2 rounded font-medium shadow-sm bg-[#0c3b87] text-white hover:bg-[#1e56a0] cursor-pointer">
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 2 */}
        {step === 2 && (
          <div>
            <div className="mb-4">
              <label htmlFor="description" className="block font-semibold mb-1">Descripcion Detallada:</label>
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
              <button type="button" onClick={prevStep} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 mb-2 sm:mt-0 cursor-pointer">
                Anterior
              </button>
              <button type="button" onClick={nextStep} className="px-4 py-2 rounded bg-[#0c3b87] text-white hover:bg-[#1e56a0] cursor-pointer">
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 3 */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <label htmlFor="evidence" className="block text-sm font-medium text-gray-800 mb-2">
                Evidencia <span className="text-gray-500">(opcional)</span>
              </label>
              <div className="relative flex-col text-center justify-center bg-white border-2 border-dashed border-gray-300 hover:border-[#0c3b87] rounded-lg shadow-sm px-4 py-3 transition hover:shadow-md">
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
                      <span className="text-gray-600 text-sm">Seleccionar multiples archivos...</span>
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
                Formatos permitidos: imagenes, documentos, audio (máx. 10MB)
              </p>
            </div>

            <div className="flex justify-between flex-col sm:flex-row">
              <button type="button" onClick={prevStep} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 mb-2 sm:mt-0 cursor-pointer">
                Anterior
              </button>
              <button type="button" onClick={nextStep} className="px-4 py-2 rounded bg-[#0c3b87] text-white hover:bg-[#1e56a0] cursor-pointer">
                Revisar
              </button>
            </div>
          </div>
        )}

        {/* Paso 4 */}
        {step === 4 && (
          <div>
            <div className="mb-6 bg-[#f7fafc] shadow-lg rounded-lg p-4 text-base/8">
              <h4 className="text-lg font-bold text-[#0c3b87]">Resumen de su denuncia</h4>
              <div className="text-sm space-y-3 mt-3 text-gray-700 ">
                <div><strong>Categoria:</strong> {formData.category}</div>
                <div><strong>Ubicacion:</strong> {formData.location || 'No proporcionada'}</div>
                <div><strong>Descripción:</strong>
                  <p className='bg-white/10 backdrop-invert backdrop-opacity-10 rounded-sm p-3'>
                    {formData.description}
                  </p>
                </div>
                <div><strong>Evidencias:</strong> {formData.evidence?.length ? `${formData.evidence.length} archivo(s)` : 'No adjuntada'}</div>
              </div>
              <p className='bg-red-500/25 backdrop-invert backdrop-opacity-10 rounded-sm p-3 text-[#2d3748] mt-3 flex flex-col sm:flex-row gap-3 items-center'>
                <Lock className='w-5 h-5 text-red-500 flex-shrink-0'/>
                La informacion proporcionada es confidencial y sera tratada segun los protocolos de seguridad establecidos.
              </p>
            </div>

            <div className="flex justify-between flex-col sm:flex-row">
              <button type="button" onClick={prevStep} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 mb-2 sm:mt-0 cursor-pointer">
                Anterior
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-[#0c3b87] text-white hover:bg-[#1e56a0] cursor-pointer">
                Enviar Denuncia
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default FormularioDenuncia;
