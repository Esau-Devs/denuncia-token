import { useState } from 'react';
import { Copy } from "@/icons/AllIcons.tsx";

export default function CopiarIdButton({ id }) {
  const [copiado, setCopiado] = useState(false);

  const copiarAlPortapapeles = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000); // Reinicia el estado después de 2 segundos
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="relative inline-block mt-2 sm:mt-0">
      <button
        onClick={copiarAlPortapapeles}
        className="bg-white/10 backdrop-invert backdrop-opacity-10 rounded-sm p-4 cursor-pointer"
        aria-label="Copiar ID"
      >
        <Copy className="w-5 h-5" />
      </button>

      {copiado && (
        <span className="absolute right-full -translate-2 mt-2 text-sm  rounded-sm p-4 font-semibold text-green-300 bg-green-300/30 backdrop-invert backdrop-opacity-10">
          Copiado
        </span>
      )}
    </div>
  );
}
