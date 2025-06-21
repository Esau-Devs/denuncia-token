import { useState, useEffect } from "react";
import { FileAlt, History } from "../icons/AllIcons";
import FormStep from "./FormStep";
import VerDenuncias from "./VerDenuncias";

export default function Denuncias({id}) {
  const [activo, setActivo] = useState(null);

  useEffect(() => {
    const guardado = localStorage.getItem("vistaActiva");
    if (guardado === "formulario" || guardado === "ver") {
      setActivo(guardado); // si hay algo guardado, úsalo
    } else {
      setActivo("formulario"); // si no, cae en formulario
    }
  }, []);

  const cambiarVista = (vista) => {
    setActivo(vista);  // cambia el estado
    localStorage.setItem("vistaActiva", vista); // lo guarda para la próxima
  };

  if (!activo) return null; // Espera hasta tener estado listo

  return (
    <div>
      <div className="flex flex-col items-center sm:flex-row text-[#0c3b87] bg-white shadow-md rounded-lg font-bold mb-6">
        <button
          onClick={() => cambiarVista("formulario")}
          className={`flex flex-row gap-2 cursor-pointer p-4 sm:w-1/2 w-full items-center justify-center ${
            activo === "formulario" ? "border-b-4 border-[#0c3b87] bg-[#f7fafc]" : ""
          }`}
        >
          <FileAlt className="w-5 h-5" />
          Nuevas Denuncias
        </button>
        <button
          onClick={() => cambiarVista("ver")}
          className={`flex flex-row gap-2 cursor-pointer p-4 sm:w-1/2 w-full items-center justify-center ${
            activo === "ver" ? "border-b-4 border-[#0c3b87] bg-[#f7fafc]" : ""
          }`}
        >
          <History className="w-5 h-5" />
          Mis Denuncias
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md text-[#0c3b87]">
        {activo === "formulario" && <FormStep id={id}/>}
        {activo === "ver" && <VerDenuncias id={id}  client:load/>}
      </div>
    </div>
  );
}
