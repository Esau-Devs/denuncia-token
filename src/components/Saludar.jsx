import {Sun, Moon,Cloudsun} from "../icons/AllIcons.jsx"
import React, { useEffect, useState } from 'react';

const Saludar = () => {
  const [saludo, setSaludo] = useState('');

  useEffect(() => {
    const obtenerSaludo = () => {
      const hora = new Date().getHours();

      if (hora >= 6 && hora < 12) {
    return (
      <>
        Buenos días <Sun className="inline w-7 h-7 text-yellow-500" />
      </>
    );
  } else if (hora >= 12 && hora < 20) {
    return (
      <>
        Buenas tardes  <Cloudsun className="inline w-7 h-7 text-orange-500 mx-3" />
      </>
    );
  } else {
    return (
      <>
        Buenas noches <Moon className="inline w-7 h-7 text-blue-500" />
      </>
    );
  }
};

    setSaludo(obtenerSaludo());
  }, []);

  return <h3 className='text-white font-semibold'>{saludo}</h3>;
};

export default Saludar