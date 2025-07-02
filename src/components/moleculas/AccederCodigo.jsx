import React, { useState } from "react";

export default function AccederConCodigo({ codigoInicial = "" }) {
  const [codigo, setCodigo] = useState(codigoInicial);
  const [mensajeAlerta, setMensajeAlerta] = useState(""); // 🆕 Estado para mensaje

  const esUUIDValido = (valor) => {
    if (!valor || valor.trim() === "") return false;
    const regexUUIDv4 =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regexUUIDv4.test(valor.trim());
  };

  const handleChange = (e) => {
    setCodigo(e.target.value);
    setMensajeAlerta(""); // Oculta alerta al escribir
  };

  const handleClick = () => {
    const valor = codigo.trim();

    if (valor === "") {
      setMensajeAlerta("El campo no puede estar vacío.");
      return;
    }

    if (!esUUIDValido(valor)) {
      setMensajeAlerta("El código ingresado no es válido.");
      return;
    }

    // Si todo está bien, redirecciona
    window.location.href = `/denuncias/${valor}`;
  };

  return (
    <div className="flex flex-col w-full  ">
      <div className="flex flex-col sm:flex-row items-center sm:focus-within:ring-2 sm:focus-within:ring-[#0c3b87] sm:rounded-l-md sm:rounded-e-lg shadow-md">
        <input
          type="text"
          id="input-code"
          placeholder="Ingresa tu código único"
          className="p-2 w-full sm:focus:outline-none border-zinc-300 shadow-2xl sm:shadow-none sm:rounded-l-md"
          value={codigo}
          onChange={handleChange}
        />
        <button
          onClick={handleClick}
          className="bg-[#0c3b87] text-white sm:px-9 sm:py-2 sm:rounded-e-md w-full sm:w-auto mt-2 sm:mt-0 py-2 hover:bg-[#1e56a0] transition-colors cursor-pointer font-semibold shadow-md"
        >
          Acceder
        </button>
      </div>

      {mensajeAlerta && (
        <div className="text-red-500 mt-2 text-sm font-semibold px-2 ">
          {mensajeAlerta}
        </div>
      )}
    </div>
  );
}
