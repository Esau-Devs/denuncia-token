import { Sun, Moon, Cloudsun } from "@/icons/AllIcons.tsx"
import React, { useEffect, useState } from 'react';

const Saludar = () => {
  const [saludo, setSaludo] = useState('');

  useEffect(() => {
    const obtenerSaludo = () => {
      const hora = new Date().getHours();

      if (hora >= 6 && hora < 12) {
        return (
          <>
            Buenos días <Sun className="w-7 h-7 text-yellow-600 mx-3" />
          </>
        );
      } else if (hora >= 12 && hora < 18) {
        return (
          <>
            Buenas tardes  <Cloudsun className=" w-7 h-7 text-orange-500 mx-3" />
          </>
        );
      } else {
        return (
          <>
            Buenas noches <Moon className="w-7 h-7 text-blue-500/29 mx-3" />
          </>
        );
      }
    };

    setSaludo(obtenerSaludo());
  }, []);

  return <span className='text-white font-semibold flex flex-row items-center text-center justify-center'>{saludo}</span>;
};

export default Saludar