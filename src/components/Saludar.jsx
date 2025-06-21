import React, { useEffect, useState } from 'react';

const Saludar = () => {
  const [saludo, setSaludo] = useState('');

  useEffect(() => {
    const obtenerSaludo = () => {
      const hora = new Date().getHours();

      if (hora >= 6 && hora < 12) {
        return 'Buenos días';
      } else if (hora >= 12 && hora < 20) {
        return 'Buenas tardes';
      } else {
        return 'Buenas noches';
      }
    };

    setSaludo(obtenerSaludo());
  }, []);

  return <h3 className='text-white font-semibold'>{saludo}</h3>;
};

export default Saludar