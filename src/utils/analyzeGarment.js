export const analyzeGarment = (measurements, options, name) => {
  let type = 'Accesorio / Básico';
  let linea = 'Unisex / Básicos';
  let telasBase = [{ ref: 'Tela Base', prov: 'Proveedor Local (Medellín)', comp: '100% Algodón', color: 'Blanco/00', ancho: '1.50', consumo: 1.00, precioMetro: 12000 }];
  let telasComp = [];
  let spi = '10-12';
  let needle = 'Universal 80/12';
  let diff = 2;
  
  let insumos = [
    { tipo: 'Hilo de Costura', uni: 'cono', cant: 0.05, ubi: 'Costuras', prov: 'Hilos Cadena (Guayabal)', obs: 'Al tono', costoUni: 6000 },
    { tipo: 'Hilaza', uni: 'cono', cant: 0.1, ubi: 'Sobrehilado', prov: 'Hilos Cadena (Guayabal)', obs: 'Al tono', costoUni: 5500 },
    { tipo: 'Marquilla Talla', uni: 'unidad', cant: 1, ubi: 'Centro escote', prov: 'Marquillas SA (Medellín)', obs: 'Tejida', costoUni: 150 }
  ];

  let procesosEsp = { estampacion: null, lavanderia: null };
  let operacional = [];
  let acabados = [
    { op: "Despeluzar y limpiar excesos de hilos", maq: "Manual / Cortahilos", tiempo: 3 },
    { op: "Revisión de calidad (Costuras y medidas)", maq: "Mesa de calidad", tiempo: 2 },
    { op: "Vaporizado / Planchado Industrial", maq: "Plancha Industrial (Caldera)", tiempo: 2 },
    { op: "Colocación de etiquetas de marca/talla", maq: "Pistola de plastiflechas", tiempo: 1 },
    { op: "Doblado y empaque individual", maq: "Mesa de empaque", tiempo: 1 }
  ];

  const addOp = (op, maq, gui, ppp, agu, hsup, hinf) => {
    operacional.push({ op, maq, gui, ppp, agu, hsup, hinf });
  };

  if (measurements.includes('chest') || measurements.includes('bustSpan')) {
    type = 'Prenda Superior (Camisa/Chaqueta)';
    linea = 'Casual / Exterior';
    telasBase = [{ ref: 'Popelina / Dril ligero', prov: 'Lafayette (La Estrella)', comp: '97% Algodón 3% Spandex', color: 'Surtido', ancho: '1.50', consumo: 1.40, precioMetro: 16500 }];
    telasComp = [{ ref: 'Entretela Fisionable', prov: 'Sutex (El Hueco)', comp: '100% Poliéster', color: 'Bl/Ng', ancho: '1.50', consumo: 0.25, precioMetro: 6000 }];
    diff = 3;
    insumos.push({ tipo: 'Botones 18L', uni: 'unidad', cant: 6, ubi: 'Pechera', prov: 'Botones (El Hueco)', obs: '4 huecos al tono', costoUni: 120 });
    procesosEsp.estampacion = { ubi: 'Pecho Frontal', tipo: 'Plastisol tacto cero', dim: '15x15 cm', res: 'Alta - 300dpi', costo: 2500 };
    
    addOp("Revisión de trazo y separación de piezas", "Mesa de corte", "-", "-", "-", "-", "-");
    addOp("Fusionar perillas, cuellos y puños", "Fijadora continua", "-", "-", "-", "-", "-");
    addOp("Dobladillar perillas delanteras", "Plana 1 Aguja", "Folder dobladillo", spi, needle, "Hilo Poliéster", "Hilo Poliéster");
    addOp("Armar cuello (Unir tapas)", "Plana 1 Aguja", "Pie prénsatela", spi, needle, "Hilo Poliéster", "Hilo Poliéster");
    addOp("Asentar cuello", "Plana 1 Aguja", "Guía 1/16", spi, needle, "Hilo Poliéster", "Hilo Poliéster");
    addOp("Fijar cuello a escote", "Plana 1 Aguja", "-", spi, needle, "Hilo Poliéster", "Hilo Poliéster");
    addOp("Unir hombros", "Cerradora / Plana", "Guía francesa", spi, needle, "Hilo Poliéster", "Hilo Poliéster");
    addOp("Armar mangas (Cerrar portañuela)", "Plana 1 Aguja", "Pie compensado", spi, needle, "Hilo Poliéster", "Hilo Poliéster");
    addOp("Pegar mangas al cuerpo", "Overlock 5 Hilos", "-", spi, needle, "Hilo Poliéster", "Hilaza");
    addOp("Cerrar costados y bajo manga", "Overlock 5 Hilos", "Guía tope", spi, needle, "Hilo Poliéster", "Hilaza");
    addOp("Armar puños y fijar a manga", "Plana 1 Aguja", "Pie prénsatela", spi, needle, "Hilo Poliéster", "Hilo Poliéster");
    addOp("Ruedo inferior", "Plana 1 Aguja", "Guía ruedo", spi, needle, "Hilo Poliéster", "Hilo Poliéster");
    addOp("Hacer ojales en perilla y puños", "Ojaleadora", "-", "-", needle, "Hilo Especial", "Hilo Poliéster");
    addOp("Fijar botones cruzados", "Botonadora", "-", "-", needle, "Hilo Especial", "-");
    addOp("Presillar aperturas críticas", "Presilladora", "-", "-", needle, "Hilo Poliéster", "Hilo Poliéster");
  } else if (measurements.includes('waistToFloor') || measurements.includes('hips')) {
    type = 'Prenda Inferior (Pantalón/Jeans)';
    linea = 'Jeanswear';
    telasBase = [{ ref: 'Denim 12oz', prov: 'Primatela (Itagüí)', comp: '100% Algodón', color: 'Azul Índigo', ancho: '1.50', consumo: 1.30, precioMetro: 24000 }];
    telasComp = [{ ref: 'Dril Bolsillería', prov: 'Lafayette (La Estrella)', comp: 'Polialgodón', color: 'Crudo', ancho: '1.50', consumo: 0.30, precioMetro: 8000 }];
    needle = 'Jeans 90/14 o 100/16';
    spi = '8-10';
    diff = 4;
    insumos.push({ tipo: 'Botón Metálico', uni: 'unidad', cant: 1, ubi: 'Pretina', prov: 'Metálicos El Hueco', obs: 'Niquelado', costoUni: 450 });
    insumos.push({ tipo: 'Cremallera Nylon', uni: 'unidad', cant: 1, ubi: 'Bragueta', prov: 'Cierres YKK', obs: '15 cm', costoUni: 800 });
    insumos.push({ tipo: 'Remaches', uni: 'unidad', cant: 4, ubi: 'Bolsillos', prov: 'Metálicos El Hueco', obs: 'Niquelados', costoUni: 150 });
    procesosEsp.lavanderia = { ubi: 'Prenda Armada', tipo: 'Stone Wash + Focalizado', nivel: 'Medio / Desgaste', tecnica: 'Láser / Manual', costo: 4500 };
    
    addOp("Filetear cantos (delanteros, traseros)", "Overlock 3 Hilos", "-", spi, needle, "Hilaza", "Hilaza");
    addOp("Cerrar pinzas traseras", "Plana 1 Aguja", "-", spi, needle, "Hilo Pesado", "Hilo Poliéster");
    addOp("Dobladillar bocas de bolsillo", "Plana 1 Aguja", "Folder", spi, needle, "Hilo Pesado", "Hilo Poliéster");
    addOp("Armar bolsillos delanteros (fijar vista)", "Plana 1 Aguja", "-", spi, needle, "Hilo Pesado", "Hilo Poliéster");
    addOp("Pegar bolsillos parche traseros", "Plana 1 Aguja", "Pie 1/16", spi, needle, "Hilo Pesado", "Hilo Poliéster");
    addOp("Armar J de bragueta (Fijar cremallera)", "Plana 1 Aguja", "Pie cremallera", spi, needle, "Hilo Pesado", "Hilo Poliéster");
    addOp("Cerrar tiro delantero y pespuntar", "Plana 1 Aguja", "Guía 1/16", spi, needle, "Hilo Pesado", "Hilo Poliéster");
    addOp("Cerrar costados", "Overlock 5 Hilos", "Guía tope", spi, needle, "Hilo Pesado", "Hilaza");
    addOp("Pespuntar costados", "Plana 2 Agujas", "Pie compensado", spi, needle, "Hilo Pesado", "Hilo Pesado");
    addOp("Cerrar entrepierna", "Cerradora de Codo", "Folder codo", spi, needle, "Hilo Pesado", "Hilo Pesado");
    addOp("Cerrar tiro trasero", "Cerradora de Codo", "-", spi, needle, "Hilo Pesado", "Hilo Pesado");
    addOp("Armar y pegar pasadores", "Plana / Recubridora", "Folder pasador", spi, needle, "Hilo Pesado", "Hilo Poliéster");
    addOp("Fijar pretina", "Pretinadora 2 Agujas", "Folder pretina", spi, needle, "Hilo Pesado", "Hilo Pesado");
    addOp("Cerrar puntas de pretina", "Plana 1 Aguja", "-", spi, needle, "Hilo Pesado", "Hilo Poliéster");
    addOp("Presillar pasadores y bolsillos", "Presilladora", "-", "-", needle, "Hilo Pesado", "Hilo Poliéster");
    addOp("Ruedo botas", "Plana 1 Aguja", "Guía ruedo", spi, needle, "Hilo Pesado", "Hilo Poliéster");
    addOp("Hacer ojal y colocar botón metálico", "Ojaleadora / Troquel", "-", "-", needle, "Hilo Especial", "-");
  } else {
    addOp("Revisión de piezas cortadas", "Mesa de corte", "-", "-", "-", "-", "-");
    addOp("Marcar piquetes y referencias", "Manual", "-", "-", "-", "-", "-");
    addOp("Fusionar refuerzos (si aplica)", "Plancha Ind.", "-", "-", "-", "-", "-");
    addOp("Filetear cantos mayores", "Overlock 3 Hilos", "-", spi, needle, "Hilaza", "Hilaza");
    addOp("Unir hombros", "Overlock 4 Hilos", "Guía tope", spi, needle, "Hilo Poliéster", "Hilaza");
    addOp("Fijar marquilla en escote", "Plana 1 Aguja", "-", spi, needle, "Hilo Poliéster", "Hilo Poliéster");
    addOp("Pegar sesgo / rib en escote", "Collarín", "Folder sesgo", spi, needle, "Hilo Poliéster", "Hilaza");
    addOp("Asentar costura escote", "Plana 1 Aguja", "Pie 1/16", spi, needle, "Hilo Poliéster", "Hilo Poliéster");
    addOp("Pegar mangas / armar sisas", "Overlock 4 Hilos", "-", spi, needle, "Hilo Poliéster", "Hilaza");
    addOp("Cerrar costados", "Overlock 4 Hilos", "Guía tope", spi, needle, "Hilo Poliéster", "Hilaza");
    addOp("Hacer ruedo inferior", "Collarín", "Guía ruedo", spi, needle, "Hilo Poliéster", "Hilaza");
    addOp("Presillar refuerzos", "Presilladora", "-", "-", needle, "Hilo Poliéster", "Hilo Poliéster");
  }

  if (measurements.includes('biceps')) diff += 1;
  if (options.length > 10) diff += 1;
  if (diff > 5) diff = 5;

  return { type, linea, telasBase, telasComp, insumos, procesosEsp, acabados, operacional, spi, needle, diff };
};
