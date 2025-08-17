import React from "react";

function generateUUID() {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function GenerarCodigo() {
  const handleClick = () => {
    const codigo = generateUUID();
    window.location.href = `/denuncias/${codigo}`;
  };

  return (
    <button
      onClick={handleClick}
      className="bg-[#0c3b87] text-white px-4 py-2 md:text-sm lg:text-base rounded hover:bg-[#1e56a0] transition-colors cursor-pointer font-semibold"
    >
      Generar Código Único
    </button>
  );
}
