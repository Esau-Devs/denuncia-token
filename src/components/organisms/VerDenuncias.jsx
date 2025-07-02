import { useEffect, useState } from "react";
import { FolderOpen, Eyes } from "@/icons/AllIcons";


function VerDenuncias({ id }) {
  const [denuncias, setDenuncias] = useState([]);
  const [detalleActivo, setDetalleActivo] = useState(null);

  useEffect(() => {
    const todas = JSON.parse(localStorage.getItem("denuncias")) || [];

    // Asociar por token (sin mostrarlo)
    const filtradas = todas.filter((d) => d.token === id);

    setDenuncias(filtradas);
  }, [id]); // <-- se actualiza si cambia el ID en la URL

  return (
    <div className="bg-white rounded-lg shadow-md text-[#0c3b87] overflow-x-auto">
      <nav className="p-6 bg-[#f7fafc]">
        <h3 className="font-bold text-xl">Mis denuncias previas</h3>
      </nav>

      {denuncias.length === 0 ? (
        <div className="flex flex-col items-center text-center text-gray-400 p-20">
          <FolderOpen className="w-10 h-10" />
          <span>No ha realizado ninguna denuncia todavia.</span>
        </div>
      ) : (
        <section className="p-6">
          <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-black font-semibold">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Categoría</th>
                <th className="px-4 py-2">Evidencias</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {denuncias.map((denuncia, index) => (
                <tr
                  key={denuncia.id || index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">
                    {denuncia.fecha
                      ? new Date(denuncia.fecha).toLocaleString("es-SV", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                      : "Fecha no disponible"}
                  </td>
                  <td className="px-4 py-2 capitalize">{denuncia.category}</td>
                  <td className="px-4 py-2">
                    {denuncia.evidence?.length || 0} archivo(s)
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setDetalleActivo(index)}
                      className="text-black hover:text-[#1e56a0] transition cursor-pointer"
                      title="Ver más detalles"
                    >
                      <Eyes className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal de detalle */}
          {detalleActivo !== null && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 text-gray-700 relative">
                <button
                  onClick={() => setDetalleActivo(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-400 text-xl"
                >
                  ×
                </button>
                <h4 className="text-lg font-bold mb-3 text-[#0c3b87]">
                  Detalle de la denuncia #{detalleActivo + 1}
                </h4>
                <p><strong>Categoría:</strong> {denuncias[detalleActivo].category}</p>
                <p><strong>Fecha:</strong> {new Date(denuncias[detalleActivo].fecha).toLocaleString("es-SV", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}</p>
                <p><strong>Ubicación:</strong> {denuncias[detalleActivo].location || "No proporcionada"}</p>
                <p className="mt-2"><strong>Descripción:</strong></p>
                <p className="bg-gray-100 p-2 rounded text-sm mt-1">{denuncias[detalleActivo].description}</p>
                <p className="mt-2"><strong>Evidencias:</strong> {denuncias[detalleActivo].evidence?.length || 0} archivo(s)</p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default VerDenuncias;
