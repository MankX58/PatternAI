import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';
import { designs } from '@freesewing/collection';
import svgs from './svgs.json';

// Modal Component for Tech Sheet Generation
function TechSheetModal({ name, fullName, onClose, editorUrl, Design, viewMode }) {
  const [step, setStep] = useState('initial'); // 'initial', 'analyzing', 'done'
  const [loadingText, setLoadingText] = useState('');
  const [techData, setTechData] = useState(null);
  const [activeTab, setActiveTab] = useState('despiece');

  const generateTechSheet = () => {
    setStep('analyzing');
    const steps = [
      "Analizando geometría del patrón...",
      "Extrayendo despiece de moldería...",
      "Calculando ruta operacional...",
      "Estructurando hoja de costos..."
    ];
    let i = 0;
    setLoadingText(steps[i]);
    const interval = setInterval(() => {
      i++;
      if (i < steps.length) {
        setLoadingText(steps[i]);
      } else {
        clearInterval(interval);
        
        // Extract real data!
        try {
          const p = new Design();
          const config = p.designConfig || {};
          const measurements = config.measurements || [];
          const parts = config.parts || [];
          const difficulty = config.data?.difficulty || 3;
          const techniques = config.data?.techniques || [];
          const options = config.options || {};
          let baseCost = 0;
          let fabricName = 'Dril / Denim (Primatela)';
          let fabricConsumption = 1.5;
          let fabricPrice = 18500;
          let sewingPrice = 12000;
          let trimsPrice = 3200;
          let cutPrice = 2500;
          let sewingTime = '45 min';

          if (difficulty <= 2) {
            fabricName = 'Algodón / Jersey (Lafayette)';
            fabricConsumption = 1.2;
            fabricPrice = 15000;
            sewingPrice = 5000;
            trimsPrice = 1500;
            cutPrice = 1500;
            sewingTime = '20 min';
          } else if (difficulty >= 4) {
            fabricName = 'Paño / Lino alta gama (Sutex)';
            fabricConsumption = 2.5;
            fabricPrice = 35000;
            sewingPrice = 28000;
            trimsPrice = 8500;
            cutPrice = 5000;
            sewingTime = '90 min';
          }

          const totalFabric = fabricConsumption * fabricPrice;
          const totalCost = totalFabric + trimsPrice + cutPrice + sewingPrice;
          const sellPrice = totalCost * 2.5;

          const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

          setTechData({
            measurements: measurements,
            parts: parts.map(pt => pt.name ? pt.name.replace(`${name}.`, '') : 'Pieza base'),
            difficulty: difficulty,
            techniques: techniques,
            optionsCount: Object.keys(options).length,
            costos: {
              fabricName,
              fabricConsumption: `${fabricConsumption.toFixed(2)} mts`,
              fabricCost: formatter.format(totalFabric),
              trimsCost: formatter.format(trimsPrice),
              cutCost: formatter.format(cutPrice),
              sewingCost: formatter.format(sewingPrice),
              sewingTime,
              totalCost: formatter.format(totalCost),
              sellPrice: formatter.format(sellPrice)
            }
          });
        } catch (e) {
          setTechData({ measurements: [], parts: ['Delantero', 'Espalda'], difficulty: 3, techniques: [], optionsCount: 0, costos: { fabricName: 'Base', fabricConsumption: '1.5 mts', fabricCost: '$18,500', trimsCost: '$3,200', cutCost: '$2,500', sewingCost: '$12,000', sewingTime: '45 min', totalCost: '$36,200', sellPrice: '$90,500' } });
        }
        
        setStep('done');
      }
    }, 1200);
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Hoja 1: Patronaje y Trazo
      const patronajeData = [
        ["FICHA TÉCNICA DE PATRONAJE Y TRAZO", "", "", ""],
        ["FECHA DE ELABORACIÓN", new Date().toLocaleDateString(), "RESPONSABLE", "PatternAI"],
        ["MARCA", "PatternAI", "LÍNEA", "Patrón Base"],
        ["COLECCIÓN", "Básicos", "TIPO PRENDA", fullName],
        ["DESCRIPCIÓN", "Ficha autogenerada a partir de modelo algorítmico", "", ""],
        [],
        ["DESPIECE DE MOLDERÍA", "", "", ""],
        ["#", "NOMBRE DE PIEZA", "CANT. CORTAR", "TEXTIL"]
      ];
      techData.parts.forEach((part, idx) => {
        patronajeData.push([idx + 1, part.replace(/([A-Z])/g, ' $1').trim().toUpperCase(), "1 par / 1 tela", "Principal"]);
      });
      patronajeData.push([]);
      patronajeData.push(["CANTIDAD TOTAL DE PIEZAS", techData.parts.length, "", ""]);
      patronajeData.push([]);
      patronajeData.push(["SESGO", "", "", "", ""]);
      patronajeData.push(["#", "MATERIAL / TEXTIL", "SENTIDO", "ANCHO SESGO", "LARGO SESGO"]);
      patronajeData.push(["1", "Tela Principal", "Al hilo", "0", "0"]);
      patronajeData.push([]);
      patronajeData.push(["TRAZO", "", "", "", ""]);
      patronajeData.push(["MATERIAL", "Tela Principal", "", "", ""]);
      patronajeData.push(["LARGO TRAZO", "1.50 mts", "", "", ""]);
      patronajeData.push(["ANCHO TELA", "1.50 mts", "", "", ""]);
      patronajeData.push(["CURVA DE TALLAS", "S, M, L, XL, XXL", "", "", ""]);
      
      const wsPatronaje = XLSX.utils.aoa_to_sheet(patronajeData);
      
      // Estilos básicos de estructura: Anchos de columna y celdas combinadas
      wsPatronaje['!cols'] = [{wch: 25}, {wch: 35}, {wch: 20}, {wch: 20}, {wch: 20}];
      wsPatronaje['!merges'] = [
        {s: {r: 0, c: 0}, e: {r: 0, c: 3}}, // Titulo
        {s: {r: 4, c: 1}, e: {r: 4, c: 3}}, // Descripcion
        {s: {r: 6, c: 0}, e: {r: 6, c: 3}}, // Despiece
      ];
      const cantRow = patronajeData.findIndex(row => row[0] === "CANTIDAD TOTAL DE PIEZAS");
      if(cantRow > -1) wsPatronaje['!merges'].push({s: {r: cantRow, c: 0}, e: {r: cantRow, c: 1}});
      const sesgoRow = patronajeData.findIndex(row => row[0] === "SESGO");
      if(sesgoRow > -1) wsPatronaje['!merges'].push({s: {r: sesgoRow, c: 0}, e: {r: sesgoRow, c: 4}});
      const trazoRow = patronajeData.findIndex(row => row[0] === "TRAZO");
      if(trazoRow > -1) wsPatronaje['!merges'].push({s: {r: trazoRow, c: 0}, e: {r: trazoRow, c: 4}});

      XLSX.utils.book_append_sheet(wb, wsPatronaje, "Patronaje y Trazo");

      // Hoja 2: Diseño, Avíos y Procesos
      const aviosData = [
        ["FICHA TÉCNICA DE DISEÑO, AVÍOS Y PROCESOS", "", "", "", "", "", ""],
        ["FECHA DE ELABORACIÓN", new Date().toLocaleDateString(), "RESPONSABLE", "PatternAI", "FICHA No.", "001", ""],
        ["MARCA", "PatternAI", "LÍNEA", "Patrón Base", "", "", ""],
        ["COLECCIÓN", "Básicos", "TIPO PRENDA", fullName, "", "", ""],
        ["DESCRIPCIÓN", "Ficha técnica completa autogenerada por inteligencia artificial con sugerencias para el mercado colombiano", "", "", "", "", ""],
        [],
        ["MATERIALES TEXTILES (RECOMENDACIÓN LOCAL)", "", "", "", "", "", ""],
        ["TIPO", "REFERENCIA", "COMPOSICIÓN", "COLOR / CÓDIGO", "PROVEEDOR SUGERIDO", "ANCHO", "CONSUMO"],
        ["Tela Base", "Dril Strech / Algodón Pima", "97% Algodón, 3% Spandex", "Azul Índigo / 001", "Primatela / Lafayette (Medellín)", "1.50 mts", "1.50 mts"],
        ["Tela Complementaria", "Dacrón / Forro Poliéster", "100% Poliéster", "Negro / 099", "Sutex / Textileras del Hueco", "1.50 mts", "0.30 mts"],
        [],
        ["INSUMOS", "", "", "", "", "", ""],
        ["TIPO DE INSUMO", "UNIDAD", "CANTIDAD", "UBICACIÓN", "PROVEEDOR", "OBSERVACIONES", ""],
        ["Hilo calibre 120", "Cono", "1", "Costuras generales", "Coats / Hilos Cadena", "Tono exacto a tela base", ""],
        ["Hilaza texturizada", "Conos", "2", "Fileteadora (Overlock)", "Coats / Hilos Cadena", "Color acorde al textil", ""],
        ["Etiqueta de marca", "Unidad", "1", "Centro escote espalda", "Marquillas S.A. / Bordamarcas", "Costura a los extremos", ""],
        ["Botones / Broches", "Unidades", "4", "Centro delantero / Puños", "Rimax / Insumos El Hueco", "Aprobados por diseño", ""],
        [],
        ["FICHA TÉCNICA DE PROCESOS (ESTAMPACIÓN, BORDADO, LAVANDERÍA)", "", "", "", "", "", ""],
        ["TIPO DE PROCESO", "UBICACIÓN EN PRENDA", "ESPECIFICACIONES TÉCNICAS", "DIMENSIONES", "TALLER SUGERIDO (MEDELLÍN)", "", ""],
        ["Estampación", "Pecho / Delantero", "Plastisol tacto cero, secado UV", "10x10 cm", "Talleres Barrio Colombia", "", ""],
        ["Bordado", "Bolsillos / Espalda", "Relleno alta densidad, hilo poliéster brillante", "5x5 cm", "Bordadurías de Itagüí", "", ""],
        ["Lavandería / Tintorería", "Prenda armada", "Lavado enzimático suavizado, desgaste ligero", "Global", "Lavanderías de La Estrella", "", ""]
      ];
      const wsAvios = XLSX.utils.aoa_to_sheet(aviosData);
      wsAvios['!cols'] = [{wch: 25}, {wch: 35}, {wch: 30}, {wch: 25}, {wch: 20}, {wch: 25}, {wch: 15}];
      wsAvios['!merges'] = [
        {s: {r: 0, c: 0}, e: {r: 0, c: 6}}, // Titulo
        {s: {r: 4, c: 1}, e: {r: 4, c: 6}}, // Descripcion
        {s: {r: 6, c: 0}, e: {r: 6, c: 6}}, // Mat Textiles
        {s: {r: 11, c: 0}, e: {r: 11, c: 6}}, // Insumos
        {s: {r: 18, c: 0}, e: {r: 18, c: 6}}, // Procesos
        {s: {r: 19, c: 4}, e: {r: 19, c: 6}}, // Header proc
        {s: {r: 20, c: 4}, e: {r: 20, c: 6}}, // Fila 1 proc
        {s: {r: 21, c: 4}, e: {r: 21, c: 6}}, // Fila 2 proc
        {s: {r: 22, c: 4}, e: {r: 22, c: 6}}  // Fila 3 proc
      ];
      XLSX.utils.book_append_sheet(wb, wsAvios, "Diseño y Avíos");

      // Hoja 3: Costos
      const costosData = [
        ["HOJA DE COSTOS Y PRESUPUESTO (COP)", "", "", ""],
        ["TIPO", "INSUMO / PROCESO", "CONSUMO", "COSTO MEDELLÍN"],
        ["Material", techData.costos.fabricName, techData.costos.fabricConsumption, techData.costos.fabricCost],
        ["Material", "Hilos e Insumos", "Global", techData.costos.trimsCost],
        ["Proceso", "Corte y Trazo", "1 Unidad", techData.costos.cutCost],
        ["Proceso", "Confección", techData.costos.sewingTime, techData.costos.sewingCost],
        [],
        ["COSTO PRENDA TERMINADA", "", "", techData.costos.totalCost],
        ["PRECIO VENTA SUGERIDO", "", "", techData.costos.sellPrice]
      ];
      const wsCostos = XLSX.utils.aoa_to_sheet(costosData);
      wsCostos['!cols'] = [{wch: 20}, {wch: 40}, {wch: 20}, {wch: 25}];
      wsCostos['!merges'] = [
        {s: {r: 0, c: 0}, e: {r: 0, c: 3}},
        {s: {r: 7, c: 0}, e: {r: 7, c: 2}}, // Costo Prenda Terminada
        {s: {r: 8, c: 0}, e: {r: 8, c: 2}}  // Precio Venta Sugerido
      ];
      XLSX.utils.book_append_sheet(wb, wsCostos, "Costos");

      XLSX.writeFile(wb, `Ficha_Tecnica_${fullName}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel", error);
      alert("Hubo un problema exportando a Excel. Revisa la consola.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${step === 'done' ? 'modal-large' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        {step === 'initial' && (
          <div className="modal-initial">
            <h2>{fullName}</h2>
            <p className="modal-subtitle">Asistente de Diseño PatternAI</p>
            
            <div className="modal-preview-image" style={{ width: '100%', height: '320px', marginBottom: '1.5rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', padding: '1rem', boxSizing: 'border-box' }}>
              {viewMode === 'line' ? (
                svgs[name] && svgs[name].includes('<svg') ? (
                  <div dangerouslySetInnerHTML={{ __html: svgs[name] }} className="svg-strict-wrapper" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Sin ilustración</span>
                  </div>
                )
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={`https://cdn.freesewing.eu/design/${name}.webp`} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div style={{ display: 'none', color: '#64748b', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>Sin foto</div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <a href={editorUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                ✂️ Editar en CAD Simplificado
              </a>
              <button className="btn-ai" onClick={generateTechSheet}>
                ✨ Generar Ficha Técnica Industrial (IA)
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="ai-loading">
            <div className="spinner"></div>
            <p>{loadingText}</p>
          </div>
        )}

        {step === 'done' && techData && (
          <div className="tech-sheet-container">
            <div className="ts-header">
              <div className="ts-title-area">
                <h2>FICHA TÉCNICA: {fullName.toUpperCase()}</h2>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <span className="ts-badge">Generado por IA</span>
                  <button onClick={exportToExcel} style={{background: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', padding: '0.3rem 0.8rem', fontSize: '0.85rem', fontWeight: 'bold'}}>📊 Exportar Excel</button>
                </div>
              </div>
              <div className="ts-meta">
                <div><strong>Dificultad:</strong> {"⭐".repeat(techData.difficulty)}{"☆".repeat(5 - techData.difficulty)}</div>
                <div><strong>Variables CAD:</strong> {techData.optionsCount} parámetros ajustables</div>
                <div><strong>Línea:</strong> Patrón Base Paramétrico</div>
              </div>
            </div>

            <div className="ts-tabs">
              <button className={activeTab === 'despiece' ? 'active' : ''} onClick={() => setActiveTab('despiece')}>Patronaje y Trazo</button>
              <button className={activeTab === 'avios' ? 'active' : ''} onClick={() => setActiveTab('avios')}>Diseño y Avíos</button>
              <button className={activeTab === 'medidas' ? 'active' : ''} onClick={() => setActiveTab('medidas')}>Medidas y Tallas</button>
              <button className={activeTab === 'operacional' ? 'active' : ''} onClick={() => setActiveTab('operacional')}>Orden Operacional</button>
              <button className={activeTab === 'costos' ? 'active' : ''} onClick={() => setActiveTab('costos')}>Costos (COP)</button>
            </div>

            <div className="ts-content">
              {activeTab === 'despiece' && (
                <div className="ts-panel">
                  <h3 style={{marginTop: 0, color: 'var(--text-heading)'}}>Despiece de Moldería</h3>
                  <table className="ts-table" style={{marginBottom: '1rem'}}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>NOMBRE DE PIEZA (Extraído)</th>
                        <th>CANT. A CORTAR</th>
                        <th>TEXTIL SUGERIDO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {techData.parts.map((part, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td style={{textTransform: 'capitalize'}}>{part.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td>1 par / 1 tela</td>
                          <td>Principal / Forro</td>
                        </tr>
                      ))}
                      <tr style={{background: 'rgba(56, 189, 248, 0.1)', fontWeight: 'bold'}}>
                        <td colSpan="2" style={{textAlign: 'right'}}>CANTIDAD TOTAL DE PIEZAS:</td>
                        <td colSpan="2">{techData.parts.length}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3 style={{marginTop: 0, color: 'var(--text-heading)'}}>Especificaciones de Trazo</h3>
                  <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                    <div style={{flex: '1 1 45%'}}>
                      <table className="ts-table">
                        <tbody>
                          <tr><td><strong>Curva de Tallas</strong></td><td>S, M, L, XL, XXL</td></tr>
                          <tr><td><strong>Ancho Tela (útil)</strong></td><td>1.50 mts</td></tr>
                          <tr><td><strong>Largo Trazo (Aprox)</strong></td><td>1.50 mts</td></tr>
                          <tr><td><strong>Sentido del Hilo</strong></td><td>Vertical (Al hilo)</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{flex: '1 1 45%', border: '1px dashed var(--border)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                      <span style={{fontSize: '2rem'}}>✂️</span>
                      <span style={{color: 'var(--text)', fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'center'}}>Visualización del trazo generada dinámicamente en exportación.</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'avios' && (
                <div className="ts-panel" style={{padding: '1.5rem'}}>
                  <div style={{background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px'}}>
                    <strong style={{color: '#10b981'}}>💡 Recomendación Local (Medellín):</strong> La IA ha adaptado esta ficha con insumos y proveedores disponibles en el mercado de la ciudad para agilizar la producción.
                  </div>

                  <h3 style={{marginTop: 0, color: 'var(--text-heading)'}}>Materiales Textiles (Sugeridos)</h3>
                  <table className="ts-table" style={{marginBottom: '2rem'}}>
                    <thead>
                      <tr>
                        <th>TIPO</th>
                        <th>REFERENCIA / COLOR</th>
                        <th>PROVEEDOR SUGERIDO</th>
                        <th>ANCHO</th>
                        <th>CONSUMO</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Tela Base</td>
                        <td>Dril Strech / Azul Índigo</td>
                        <td>Primatela / Lafayette</td>
                        <td>1.50 mts</td>
                        <td>1.50 mts</td>
                      </tr>
                      <tr>
                        <td>Tela Complementaria</td>
                        <td>Forro Poliéster / Negro</td>
                        <td>Sutex / El Hueco</td>
                        <td>1.50 mts</td>
                        <td>0.30 mts</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3 style={{marginTop: 0, color: 'var(--text-heading)'}}>Avíos e Insumos</h3>
                  <table className="ts-table" style={{marginBottom: '2rem'}}>
                    <thead>
                      <tr>
                        <th>ÍTEM</th>
                        <th>CANTIDAD</th>
                        <th>UNIDAD</th>
                        <th>UBICACIÓN</th>
                        <th>PROVEEDOR / OBS.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Hilo calibre 120</td>
                        <td>1</td>
                        <td>Cono</td>
                        <td>Costuras generales</td>
                        <td>Coats / Cadena</td>
                      </tr>
                      <tr>
                        <td>Hilaza texturizada</td>
                        <td>2</td>
                        <td>Conos</td>
                        <td>Fileteadora</td>
                        <td>Coats / Cadena</td>
                      </tr>
                      <tr>
                        <td>Botones / Broches</td>
                        <td>4</td>
                        <td>Unidad</td>
                        <td>Delantero / Puños</td>
                        <td>Rimax / Insumos Centro</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3 style={{marginTop: 0, color: 'var(--text-heading)'}}>Procesos: Estampación, Bordado, Lavandería</h3>
                  <table className="ts-table">
                    <thead>
                      <tr>
                        <th>PROCESO</th>
                        <th>UBICACIÓN</th>
                        <th>TALLER SUGERIDO</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Estampación</td>
                        <td>Pecho / Delantero</td>
                        <td>Barrio Colombia</td>
                      </tr>
                      <tr>
                        <td>Bordado</td>
                        <td>Bolsillos / Espalda</td>
                        <td>Bordadurías Itagüí</td>
                      </tr>
                      <tr>
                        <td>Lavandería</td>
                        <td>Prenda armada</td>
                        <td>Lavanderías La Estrella</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'medidas' && (
                <div className="ts-panel">
                  <table className="ts-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>MEDIDA ANATÓMICA REQUERIDA</th>
                        <th>TOLERANCIA / HOLGURA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {techData.measurements.map((m, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td style={{textTransform: 'capitalize'}}>{m.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td>Ajustable en CAD</td>
                        </tr>
                      ))}
                      {techData.measurements.length === 0 && (
                        <tr><td colSpan="3">Este patrón utiliza tallaje estandarizado sin medidas específicas obligatorias.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'operacional' && (
                <div className="ts-panel">
                  <table className="ts-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>OPERACIÓN SUGERIDA (IA)</th>
                        <th>MAQUINARIA</th>
                        <th>AGUJA / HILO</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>Filetear cantos y preparar piezas</td>
                        <td>Overlock (Fileteadora)</td>
                        <td>Punta de bola / Poliéster</td>
                      </tr>
                      {techData.techniques.map((tech, idx) => (
                        <tr key={idx + 2}>
                          <td>{idx + 2}</td>
                          <td style={{textTransform: 'capitalize'}}>Aplicar técnica: {tech}</td>
                          <td>Plana / Especial</td>
                          <td>Estándar</td>
                        </tr>
                      ))}
                      <tr>
                        <td>{techData.techniques.length + 2}</td>
                        <td>Ensamblar estructura principal</td>
                        <td>Plana de 1 aguja</td>
                        <td>Universal 80/12</td>
                      </tr>
                      <tr>
                        <td>{techData.techniques.length + 3}</td>
                        <td>Terminaciones, ruedos y planchado final</td>
                        <td>Plana / Plancha industrial</td>
                        <td>-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'costos' && (
                <div className="ts-panel">
                  <table className="ts-table">
                    <thead>
                      <tr>
                        <th>TIPO</th>
                        <th>INSUMO / PROCESO</th>
                        <th>CONSUMO (Aprox)</th>
                        <th>COSTO MEDELLÍN (COP)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Material</td>
                        <td>{techData.costos.fabricName}</td>
                        <td>{techData.costos.fabricConsumption}</td>
                        <td>{techData.costos.fabricCost}</td>
                      </tr>
                      <tr>
                        <td>Material</td>
                        <td>Hilos de confección e Insumos</td>
                        <td>Global</td>
                        <td>{techData.costos.trimsCost}</td>
                      </tr>
                      <tr>
                        <td>Proceso</td>
                        <td>Corte y Trazo</td>
                        <td>1 Unidad</td>
                        <td>{techData.costos.cutCost}</td>
                      </tr>
                      <tr>
                        <td>Proceso</td>
                        <td>Confección (Tiempo Operacional)</td>
                        <td>~{techData.costos.sewingTime}</td>
                        <td>{techData.costos.sewingCost}</td>
                      </tr>
                      <tr style={{background: 'rgba(56, 189, 248, 0.1)', fontWeight: 'bold'}}>
                        <td colSpan="3" style={{textAlign: 'right', color: 'var(--text-heading)'}}>COSTO PRENDA TERMINADA:</td>
                        <td style={{color: 'var(--text-heading)'}}>{techData.costos.totalCost}</td>
                      </tr>
                      <tr style={{background: 'rgba(168, 85, 247, 0.1)', fontWeight: 'bold'}}>
                        <td colSpan="3" style={{textAlign: 'right', color: 'var(--text-heading)'}}>PRECIO DE VENTA SUGERIDO (x2.5):</td>
                        <td style={{color: 'var(--text-heading)'}}>{techData.costos.sellPrice}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="ts-note">
                    <strong>Análisis IA:</strong> Valores promedio referenciados para talleres y maquilas en el área metropolitana de Medellín, Colombia.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PatternCard({ name, Design, viewMode, onSelect, isHidden }) {
  const lineDrawing = svgs[name];
  const photoUrl = `https://cdn.freesewing.eu/design/${name}.webp`;
  const [photoError, setPhotoError] = useState(false);
  
  let fullName = name;
  try {
    const p = new Design();
    if (p.designConfig?.data?.name) {
      fullName = p.designConfig.data.name;
    }
  } catch (e) {
    // Ignore error, fallback to name
  }

  const editorState = JSON.stringify({ design: name, view: 'measurements' });
  const editorUrl = `https://freesewing.eu/editor/#s=${encodeURIComponent(editorState)}`;

  return (
    <div className={`pattern-card-link ${isHidden ? 'hidden-card' : ''}`} onClick={() => onSelect({ name, fullName, editorUrl, Design })} style={{cursor: 'pointer', order: isHidden ? 999 : 1}}>
      <div className="pattern-card">
        <h2 style={{ textTransform: 'capitalize' }}>{fullName}</h2>
        <div className="svg-container">
          {viewMode === 'line' ? (
            lineDrawing && lineDrawing.includes('<svg') ? (
              <div 
                dangerouslySetInnerHTML={{ __html: lineDrawing }} 
                style={{ width: '100%', height: '100%', display: 'flex', justifyItems: 'center', alignItems: 'center' }} 
                className="line-drawing-svg"
              />
            ) : (
              <span style={{ color: '#64748b' }}>Sin ilustración</span>
            )
          ) : (
            photoError ? (
              <span style={{ color: '#64748b' }}>Sin foto</span>
            ) : (
              <img 
                src={photoUrl} 
                alt={`${fullName} example`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                onError={() => setPhotoError(true)}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [viewMode, setViewMode] = useState('line');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.body.setAttribute('data-theme', !isLightMode ? 'light' : 'dark');
  };

  const filteredNames = Object.entries(designs).filter(([name, Design]) => {
    let fullName = name;
    try {
      const p = new Design();
      if (p.designConfig?.data?.name) fullName = p.designConfig.data.name;
    } catch(e){}
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) || name.toLowerCase().includes(searchTerm.toLowerCase());
  }).map(([name]) => name);

  return (
    <div className="app-container">
      <button 
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 1000,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-heading)',
          padding: '0.8rem 1.2rem',
          borderRadius: '50px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: 'var(--shadow)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {isLightMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>

      <header className="hero">
        <div className="hero-content">
          <div className="ai-badge">V 1.0 Alpha</div>
          <h1>PatternAI</h1>
          <p>La plataforma inteligente todo en uno para diseño de moda. Genera fichas técnicas al instante, optimiza tus costos y crea patrones con IA.</p>
          
          <div className="waitlist-container">
            {!showWaitlist ? (
              <button className="btn-ai" onClick={() => setShowWaitlist(true)}>
                🚀 Solicitar acceso Beta
              </button>
            ) : (
              <form className="waitlist" onSubmit={(e) => { e.preventDefault(); alert("¡Gracias por tu interés! Te contactaremos pronto."); setShowWaitlist(false); }}>
                <select style={{ flex: 1, padding: '1rem', borderRadius: '50px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-heading)', outline: 'none' }} required>
                  <option value="">Nivel de Interés (1-5)</option>
                  <option value="5">5 - ¡Lo necesito ya!</option>
                  <option value="4">4 - Muy interesado</option>
                  <option value="3">3 - Interesado</option>
                  <option value="2">2 - Curioso</option>
                  <option value="1">1 - Poco interesado</option>
                </select>
                <input type="text" placeholder="Herramienta actual (ej. Optitex)" required />
                <input type="email" placeholder="Tu correo electrónico" required />
                <button type="submit">Unirme</button>
              </form>
            )}
          </div>
        </div>
      </header>

        <div className="marketplace-header">
          <h2>Marketplace de Patrones Base</h2>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="🔍 Buscar patrón (ej. Camisa, Vestido, Aaron)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="controls">
            <button 
              className={viewMode === 'line' ? 'active' : ''} 
              onClick={() => setViewMode('line')}
            >
              Ilustraciones
            </button>
            <button 
              className={viewMode === 'photo' ? 'active' : ''} 
              onClick={() => setViewMode('photo')}
            >
              Fotografías
            </button>
          </div>
        </div>

      <main className="gallery-container">
        {Object.entries(designs)
          .map(([name, Design]) => {
          const isHidden = !filteredNames.includes(name);
          return (
            <PatternCard key={name} name={name} Design={Design} viewMode={viewMode} onSelect={setSelectedPattern} isHidden={isHidden} />
          );
        })}
        {filteredNames.length === 0 && (
          <div className="no-results">No se encontraron patrones con "{searchTerm}"</div>
        )}
      </main>

      {selectedPattern && (
        <TechSheetModal 
          {...selectedPattern} 
          viewMode={viewMode}
          onClose={() => setSelectedPattern(null)} 
        />
      )}
    </div>
  );
}

export default App;
