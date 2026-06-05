import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
import confetti from 'canvas-confetti';
import { analyzeGarment } from '../utils/analyzeGarment';

export function TechPanel({ name, fullName, editorUrl, Design }) {
  const [step, setStep] = useState('initial');
  const [loadingText, setLoadingText] = useState('');
  const [techData, setTechData] = useState(null);
  const [activeTab, setActiveTab] = useState('diseño');

  useEffect(() => {
    setStep('initial');
    setTechData(null);
    setActiveTab('diseño');
  }, [name]);

  const generateTechSheet = () => {
    setStep('analyzing');
    const steps = [
      "Mapeando variables paramétricas...",
      "Calculando consumo de materiales...",
      "Generando rutas de confección y acabados...",
      "Prorrateando Costos Indirectos (CIF)...",
      "Calculando escandallo final de costos..."
    ];
    let i = 0;
    setLoadingText(steps[i]);
    const interval = setInterval(() => {
      i++;
      if (i < steps.length) {
        setLoadingText(steps[i]);
      } else {
        clearInterval(interval);
        try {
          const p = new Design();
          const config = p.designConfig || {};
          const measurements = config.measurements || [];
          const parts = config.parts || [];
          const optionsList = Object.keys(config.options || {});
          
          const analysis = analyzeGarment(measurements, optionsList, name);
          
          let totalTelas = analysis.telasBase.reduce((acc, t) => acc + (t.consumo * t.precioMetro), 0) + 
                           analysis.telasComp.reduce((acc, t) => acc + (t.consumo * t.precioMetro), 0);
          let totalInsumos = analysis.insumos.reduce((acc, i) => acc + (i.cant * i.costoUni), 0);
          let totalMateriales = totalTelas + totalInsumos;

          let sewingTime = analysis.diff * 18; 
          let valMinuto = 250; 
          let sewingPrice = sewingTime * valMinuto;
          let cutPrice = analysis.diff * 800;
          let terminacionPrice = analysis.acabados.reduce((acc, a) => acc + (a.tiempo * valMinuto), 0);
          let procesoEspPrice = (analysis.procesosEsp.estampacion?.costo || 0) + (analysis.procesosEsp.lavanderia?.costo || 0);
          let totalProcesos = cutPrice + sewingPrice + terminacionPrice + procesoEspPrice;

          let cifUnit = {
            arriendo: sewingTime * 30,
            seguros: sewingTime * 5,
            seguridadSocial: sewingTime * 15,
            salariosAdmin: sewingTime * 20,
            gastosFijosSS: sewingTime * 5,
            prestamo: sewingTime * 8,
            comisiones: sewingTime * 10,
            representacion: sewingTime * 5,
            transporte: sewingTime * 15,
            serviciosP: sewingTime * 12,
            intereses: sewingTime * 4,
            depreciacion: sewingTime * 6
          };
          let totalCIF = Object.values(cifUnit).reduce((a, b) => a + b, 0);

          const ptoEquilibrio = totalMateriales + totalProcesos + totalCIF;
          const sellPrice = ptoEquilibrio * 2; 

          const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

          const colores = [
            { t: 'Color 1', c: 'Blanco', cod: '001', hil: 'Blanco' },
            { t: 'Color 2', c: 'Negro', cod: '099', hil: 'Negro' },
            { t: 'Color 3', c: 'Azul Marino', cod: '010', hil: 'Azul Oscuro' }
          ];

          setTechData({
            type: analysis.type, linea: analysis.linea, telasBase: analysis.telasBase, telasComp: analysis.telasComp,
            insumos: analysis.insumos, procesosEsp: analysis.procesosEsp, acabados: analysis.acabados, operacional: analysis.operacional, colores: colores,
            spi: analysis.spi, needle: analysis.needle, measurements: measurements,
            parts: parts.map(pt => pt.name ? pt.name.replace(`${name}.`, '') : 'Pieza estructural'),
            difficulty: analysis.diff, optionsCount: optionsList.length,
            costos: {
              materiales: totalMateriales,
              procesos: totalProcesos,
              cifUnit: cifUnit,
              totalCIF: totalCIF,
              ptoEquilibrio: ptoEquilibrio,
              sellPrice: sellPrice,
              
              f_materiales: formatter.format(totalMateriales),
              f_procesos: formatter.format(totalProcesos),
              f_totalCIF: formatter.format(totalCIF),
              f_ptoEquilibrio: formatter.format(ptoEquilibrio),
              f_sellPrice: formatter.format(sellPrice),

              detallesProcesos: [
                { nombre: "TRAZO Y CORTE", costoUni: cutPrice, cant: 1, total: cutPrice },
                { nombre: "PROCESOS ESPECIALES", costoUni: procesoEspPrice, cant: 1, total: procesoEspPrice },
                { nombre: "CONFECCIÓN", costoUni: sewingPrice, cant: 1, total: sewingPrice },
                { nombre: "TERMINACIÓN", costoUni: terminacionPrice, cant: 1, total: terminacionPrice }
              ]
            }
          });
        } catch (e) {
          console.error(e);
        }
        setStep('done');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.5, x: 0.8 }, colors: ['#38bdf8', '#10b981', '#a855f7'], zIndex: 9999 });
      }
    }, 800);
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const dateStr = new Date().toLocaleDateString();

      const stHeaderGreen = { font: { bold: true, color: { rgb: "000000" } }, fill: { fgColor: { rgb: "C4E5C0" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} } };
      const stHeaderPink = { font: { bold: true, color: { rgb: "000000" } }, fill: { fgColor: { rgb: "F4CCCC" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} } };
      const stHeaderBlue = { font: { bold: true, color: { rgb: "000000" } }, fill: { fgColor: { rgb: "C9DAF8" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} } };
      
      const stCell = { alignment: { vertical: "center", wrapText: true }, border: { bottom: {style:'hair', color: {rgb:"A6A6A6"}}, top:{style:'hair', color: {rgb:"A6A6A6"}}, left:{style:'hair', color: {rgb:"A6A6A6"}}, right:{style:'hair', color: {rgb:"A6A6A6"}} } };
      const stCellBold = { font: {bold: true}, alignment: { vertical: "center", wrapText: true }, border: { bottom: {style:'hair', color: {rgb:"A6A6A6"}}, top:{style:'hair', color: {rgb:"A6A6A6"}}, left:{style:'hair', color: {rgb:"A6A6A6"}}, right:{style:'hair', color: {rgb:"A6A6A6"}} } };
      
      const stMoney = { ...stCell, numFmt: "$#,##0.00" };
      
      const applyStyles = (ws, rangeObj, style) => {
        for(let R = rangeObj.s.r; R <= rangeObj.e.r; ++R) {
          for(let C = rangeObj.s.c; C <= rangeObj.e.c; ++C) {
            let cell = XLSX.utils.encode_cell({r:R, c:C});
            if(!ws[cell]) ws[cell] = { t: "s", v: "" };
            ws[cell].s = style;
          }
        }
      };

      const dData = [
        ["FICHA TÉCNICA DE DISEÑO", "", "", "", "", "", "", ""],
        ["FECHA DE ELABORACIÓN", dateStr, "", "RESPONSABLE", "PatternAI", "", "FICHA No.", "001"],
        ["MARCA", "PatternAI", "", "LÍNEA", techData.linea, "", "", ""],
        ["COLECCIÓN", "Básicos", "", "TIPO PRENDA", techData.type, "", "", ""],
        ["PLANOS TÉCNICOS", "", "", "", "", "", "", ""],
        ["(Ropero frente y espalda con detalles. Descripciones y observaciones de la prenda usando flechas para dar claridad...)", "", "", "(Espacio para CAD Frente)", "", "(Espacio para CAD Espalda)", "", ""],
        ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""],
        ["CURVA DE TALLAS", "", "", "", "CURVA DE COLOR", "", "", ""],
        ["TALLAS", "S", "M", "L", "XL", "COLOR", "CÓDIGO", "CANTIDAD"],
        ["CANTIDAD", "", "", "", "", "", "", ""],
        ["FICHA TÉCNICA DE AVÍOS", "", "", "", "", "", "", ""],
        ["MATERIALES TEXTILES", "", "", "", "", "", "", ""],
        ["TELA BASE", "", "", "(Muestra)", "TELA COMPLEMENTARIA", "", "", "(Muestra)"]
      ];
      
      techData.telasBase.forEach(t => {
        dData.push(["Referencia", t.ref, "", "", "Referencia", techData.telasComp[0]?.ref||"-", "", ""]);
        dData.push(["Proveedor", t.prov, "", "", "Proveedor", techData.telasComp[0]?.prov||"-", "", ""]);
        dData.push(["Composición", t.comp, "", "", "Composición", techData.telasComp[0]?.comp||"-", "", ""]);
        dData.push(["Color/Código", t.color||"Surtido", "", "", "Color/Código", techData.telasComp[0]?.color||"-", "", ""]);
        dData.push(["Ancho tela", t.ancho, "", "", "Ancho tela", techData.telasComp[0]?.ancho||"-", "", ""]);
        dData.push(["Consumo", t.consumo, "", "", "Consumo", techData.telasComp[0]?.consumo||"-", "", ""]);
      });

      dData.push(["INSUMOS", "", "", "", "", "", "", ""]);
      dData.push(["Tipo de Insumo", "Unidad de Medida", "Cantidad por Unidad", "Ubicación", "Proveedor", "Observaciones", "Muestra Física", ""]);
      techData.insumos.forEach(ins => dData.push([ins.tipo, ins.uni, ins.cant, ins.ubi, ins.prov, ins.obs, "", ""]));

      let procStart = dData.length;
      dData.push(["FICHA TÉCNICA DE PROCESOS", "", "", "", "", "", "", ""]);
      
      dData.push(["ESTAMPACIÓN", "", "", "", "", "", "", ""]);
      dData.push(["ESPECIFICACIONES TÉCNICAS", "", "(Rapport / Muestra visual estampación con cotas)", "", "", "", "", ""]);
      let est = techData.procesosEsp.estampacion || { ubi: "-", dim: "-", tipo: "-", res: "-" };
      dData.push(["Ubicación", est.ubi, "", "", "", "", "", ""]);
      dData.push(["Dimensiones", est.dim, "", "", "", "", "", ""]);
      dData.push(["Tipo de Tinta", est.tipo, "", "", "", "", "", ""]);
      dData.push(["Resolución", est.res, "", "", "", "", "", ""]);
      dData.push(["Acabados", "-", "", "", "", "", "", ""]);
      dData.push(["", "", "", "", "", "", "", ""]);

      let tintStart = dData.length;
      dData.push(["TINTORERÍA O DESGASTE", "", "", "", "", "", "", ""]);
      dData.push(["ESPECIFICACIONES TÉCNICAS", "", "(Rapport / Muestra visual desgaste con cotas)", "", "", "", "", ""]);
      let lav = techData.procesosEsp.lavanderia || { ubi: "-", tipo: "-", nivel: "-", tecnica: "-" };
      dData.push(["Ubicación", lav.ubi, "", "", "", "", "", ""]);
      dData.push(["Tipo Proceso", lav.tipo, "", "", "", "", "", ""]);
      dData.push(["Nivel Desgaste", lav.nivel, "", "", "", "", "", ""]);
      dData.push(["Técnica", lav.tecnica, "", "", "", "", "", ""]);
      dData.push(["", "", "", "", "", "", "", ""]);

      const wsDiseno = XLSX.utils.aoa_to_sheet(dData);
      wsDiseno['!cols'] = [{wch: 22}, {wch: 16}, {wch: 16}, {wch: 22}, {wch: 22}, {wch: 18}, {wch: 18}, {wch: 15}];
      
      applyStyles(wsDiseno, {s:{r:0,c:0},e:{r:dData.length-1,c:7}}, stCell);
      applyStyles(wsDiseno, {s:{r:0,c:0},e:{r:0,c:7}}, stHeaderGreen); 
      applyStyles(wsDiseno, {s:{r:4,c:0},e:{r:4,c:7}}, stHeaderGreen); 
      applyStyles(wsDiseno, {s:{r:12,c:0},e:{r:12,c:7}}, stHeaderGreen); 
      applyStyles(wsDiseno, {s:{r:15,c:0},e:{r:15,c:7}}, stHeaderPink); 
      applyStyles(wsDiseno, {s:{r:16,c:0},e:{r:16,c:7}}, stHeaderPink); 
      
      let insumoRow = 18 + (techData.telasBase.length * 6);
      applyStyles(wsDiseno, {s:{r:insumoRow,c:0},e:{r:insumoRow,c:7}}, stHeaderPink); 
      
      applyStyles(wsDiseno, {s:{r:procStart,c:0},e:{r:procStart,c:7}}, stHeaderBlue); 
      applyStyles(wsDiseno, {s:{r:procStart+1,c:0},e:{r:procStart+1,c:7}}, stHeaderBlue); 
      applyStyles(wsDiseno, {s:{r:tintStart,c:0},e:{r:tintStart,c:7}}, stHeaderBlue); 
      
      applyStyles(wsDiseno, {s:{r:17,c:0},e:{r:insumoRow-1,c:0}}, stCellBold);
      applyStyles(wsDiseno, {s:{r:17,c:4},e:{r:insumoRow-1,c:4}}, stCellBold);

      wsDiseno['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:7}}, {s:{r:4,c:0},e:{r:4,c:7}}, 
        {s:{r:5,c:0},e:{r:11,c:2}}, 
        {s:{r:5,c:3},e:{r:11,c:4}}, 
        {s:{r:5,c:5},e:{r:11,c:7}}, 
        {s:{r:12,c:0},e:{r:12,c:3}}, {s:{r:12,c:4},e:{r:12,c:7}}, 
        {s:{r:15,c:0},e:{r:15,c:7}}, {s:{r:16,c:0},e:{r:16,c:7}}, 
        {s:{r:17,c:0},e:{r:17,c:2}}, {s:{r:17,c:4},e:{r:17,c:6}},
        {s:{r:insumoRow,c:0},e:{r:insumoRow,c:7}}, 
        {s:{r:procStart,c:0},e:{r:procStart,c:7}},
        {s:{r:procStart+1,c:0},e:{r:procStart+1,c:7}}, 
        {s:{r:procStart+2,c:0},e:{r:procStart+2,c:1}}, 
        {s:{r:procStart+2,c:2},e:{r:procStart+7,c:7}}, 
        {s:{r:tintStart,c:0},e:{r:tintStart,c:7}}, 
        {s:{r:tintStart+1,c:0},e:{r:tintStart+1,c:1}}, 
        {s:{r:tintStart+1,c:2},e:{r:tintStart+5,c:7}} 
      ];
      XLSX.utils.book_append_sheet(wb, wsDiseno, "DISEÑO, AVIOS Y PROCESOS");


      const opData = [
        ["FICHA TÉCNICA CONFECCIÓN", "", "", "", "", "", "", ""],
        ["FECHA DE ELABORACIÓN", dateStr, "", "RESPONSABLE", "PatternAI", "", "FICHA No.", "001"],
        ["MARCA", "PatternAI", "", "LÍNEA", techData.linea, "", "", ""],
        ["COLECCIÓN", "Básicos", "", "TIPO PRENDA", techData.type, "", "", ""],
        ["SISTEMA OPERACIONAL", "", "", "", "", "", "", ""],
        ["#", "OPERACIÓN", "MAQUINARIA O EQUIPO", "GUÍAS", "PPP", "AGUJAS", "HILO SUP", "HILO INF"]
      ];
      techData.operacional.forEach((op, idx) => opData.push([idx + 1, op.op, op.maq, op.gui, op.ppp, op.agu, op.hsup, op.hinf]));
      
      for(let i=0; i<5; i++) opData.push(["", "", "", "", "", "", "", ""]);

      const wsOp = XLSX.utils.aoa_to_sheet(opData);
      applyStyles(wsOp, {s:{r:0,c:0},e:{r:opData.length-1,c:7}}, stCell);
      applyStyles(wsOp, {s:{r:0,c:0},e:{r:0,c:7}}, { fill: { fgColor: { rgb: "F4CCCC" } }, font: { bold: true, sz: 14 }}); 
      applyStyles(wsOp, {s:{r:4,c:0},e:{r:4,c:7}}, { fill: { fgColor: { rgb: "F4CCCC" } }, font: { bold: true }}); 
      applyStyles(wsOp, {s:{r:5,c:0},e:{r:5,c:7}}, { fill: { fgColor: { rgb: "F4CCCC" } }, font: { bold: true }});
      
      wsOp['!cols'] = [{wch: 5}, {wch: 45}, {wch: 25}, {wch: 15}, {wch: 6}, {wch: 20}, {wch: 12}, {wch: 12}];
      wsOp['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:7}}, 
        {s:{r:4,c:0},e:{r:4,c:7}},
        {s:{r:1,c:1},e:{r:1,c:2}}, {s:{r:2,c:1},e:{r:2,c:2}}, {s:{r:3,c:1},e:{r:3,c:2}}
      ];
      XLSX.utils.book_append_sheet(wb, wsOp, "ORDEN OPERACIONAL");

      const cData = [
        ["FICHA DE COSTOS", "", "", "", "", "", "", "", ""],
        ["FECHA DE ELABORACIÓN", dateStr, "RESPONSABLE", "PatternAI", "FICHA No.", "001", "", "", ""],
        ["MARCA", "PatternAI", "LÍNEA", techData.linea, "", "", "", "", ""],
        ["COLECCIÓN", "Básicos", "TIPO PRENDA", techData.type, "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["MATERIALES", "DESCRIPCIÓN", "PROVEEDOR", "ANCHO", "UNIDAD", "COSTO UNI", "CONSUMO", "TOTAL", ""],
      ];
      
      const stGreenLight = { fill: { fgColor: { rgb: "92D050" } }, font: { bold: true, color: {rgb:"000000"}}, alignment: { horizontal: "center", vertical: "center" }, border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} } };
      const stBlueCIF = { fill: { fgColor: { rgb: "5B9BD5" } }, font: { bold: true, color: {rgb:"FFFFFF"}}, alignment: { horizontal: "center", vertical: "center" }, border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} } };
      const stYellow = { fill: { fgColor: { rgb: "FFFF00" } }, border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} } };
      const stTotalRow = { font: {bold: true}, alignment: {horizontal: "right"}, border: { bottom: {style:'thin'}, top:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} } };
      const stTotalRed = { font: {bold: true, color: {rgb:"FF0000"}}, alignment: {horizontal: "right"}, numFmt: "$#,##0.00", border: { bottom: {style:'thin'}, top:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} } };

      techData.telasBase.forEach(t => cData.push(["Tela Base", t.ref, t.prov, t.ancho, "mts", t.precioMetro, t.consumo, t.precioMetro * t.consumo, ""]));
      techData.telasComp.forEach(t => cData.push(["Tela Complementaria", t.ref, t.prov, t.ancho, "mts", t.precioMetro, t.consumo, t.precioMetro * t.consumo, ""]));
      techData.insumos.forEach(i => cData.push([i.tipo, i.obs, i.prov, "-", i.uni, i.costoUni, i.cant, i.costoUni * i.cant, ""]));
      
      cData.push(["", "", "", "", "", "", "TOTAL COSTO MATERIALES", techData.costos.materiales, ""]);
      cData.push(["", "", "", "", "", "", "", "", ""]);

      cData.push(["PROCESO", "DESCRIPCIÓN", "PROVEEDOR/ÁREA", "", "UNIDAD", "COSTO UNI", "CANTIDAD", "TOTAL", ""]);
      techData.costos.detallesProcesos.forEach(p => cData.push([p.nombre, "-", "Interno / Externo", "", "und", p.costoUni, p.cant, p.total, ""]));
      
      cData.push(["", "", "", "", "", "", "TOTAL COSTO PROCESOS", techData.costos.procesos, ""]);
      cData.push(["", "", "", "", "", "", "", "", ""]);

      const cifStartRow = cData.length;
      cData.push(["COSTOS FIJOS Y VARIABLES (CIF)", "DESCRIPCIÓN DEL COSTO", "", "", "", "COSTO UNI (Prorrateo)", "CANTIDAD", "TOTAL", ""]);
      const cifMap = {
        arriendo: "ARRIENDO", seguros: "SEGUROS", seguridadSocial: "SEGURIDAD SOCIAL", salariosAdmin: "SALARIOS ADMINISTRATIVOS",
        gastosFijosSS: "GASTOS FIJOS DE SEGURIDAD SOCIAL", prestamo: "PRÉSTAMO", comisiones: "COMISIONES", representacion: "GASTOS DE REPRESENTACIÓN",
        transporte: "TRANSPORTE", serviciosP: "SERVICIOS PÚBLICOS", intereses: "INTERESES", depreciacion: "DEPRECIACIÓN"
      };
      
      Object.keys(cifMap).forEach(key => {
        cData.push(["FIJOS / VARIABLES", cifMap[key], "", "", "", techData.costos.cifUnit[key], 1, techData.costos.cifUnit[key], ""]);
      });

      cData.push(["", "", "", "", "", "", "TOTAL CIF", techData.costos.totalCIF, ""]);
      cData.push(["", "", "", "", "", "", "", "", ""]);
      cData.push(["COSTOS PRENDA TERMINADA EN PUNTO DE EQUILIBRIO", "", "", "", "", "", "", techData.costos.ptoEquilibrio, ""]);
      cData.push(["COSTOS PRENDA CON UTILIDAD - Precio de Venta Sugerido", "", "", "", "", "", "", techData.costos.sellPrice, ""]);

      const wsCostos = XLSX.utils.aoa_to_sheet(cData);
      applyStyles(wsCostos, {s:{r:0,c:0},e:{r:100,c:8}}, stCell);
      applyStyles(wsCostos, {s:{r:0,c:0},e:{r:0,c:8}}, stGreenLight); 
      
      let matRow = 5;
      applyStyles(wsCostos, {s:{r:matRow,c:0},e:{r:matRow,c:7}}, stGreenLight);
      let procRow = cData.findIndex(r => r[0] === "PROCESO");
      applyStyles(wsCostos, {s:{r:procRow,c:0},e:{r:procRow,c:7}}, stGreenLight);
      
      applyStyles(wsCostos, {s:{r:cifStartRow,c:0},e:{r:cifStartRow,c:7}}, stGreenLight);
      applyStyles(wsCostos, {s:{r:cifStartRow+1,c:0},e:{r:cifStartRow+12,c:0}}, stBlueCIF); 
      applyStyles(wsCostos, {s:{r:cifStartRow+5,c:1},e:{r:cifStartRow+5,c:7}}, stYellow); 
      
      applyStyles(wsCostos, {s:{r:procRow-2,c:6},e:{r:procRow-2,c:6}}, stTotalRow);
      applyStyles(wsCostos, {s:{r:procRow-2,c:7},e:{r:procRow-2,c:7}}, stTotalRed);
      
      let totProcRow = cData.findIndex(r => r[6] === "TOTAL COSTO PROCESOS");
      applyStyles(wsCostos, {s:{r:totProcRow,c:6},e:{r:totProcRow,c:6}}, stTotalRow);
      applyStyles(wsCostos, {s:{r:totProcRow,c:7},e:{r:totProcRow,c:7}}, stTotalRed);
      
      let totCifRow = cData.findIndex(r => r[6] === "TOTAL CIF");
      applyStyles(wsCostos, {s:{r:totCifRow,c:6},e:{r:totCifRow,c:6}}, stTotalRow);
      applyStyles(wsCostos, {s:{r:totCifRow,c:7},e:{r:totCifRow,c:7}}, stTotalRed);
      
      let ptoEqRow = cData.length - 2;
      applyStyles(wsCostos, {s:{r:ptoEqRow,c:0},e:{r:ptoEqRow,c:6}}, {fill: {fgColor:{rgb:"A9D08E"}}, font:{bold:true}});
      applyStyles(wsCostos, {s:{r:ptoEqRow,c:7},e:{r:ptoEqRow,c:7}}, stTotalRed);
      
      let pvpRow = cData.length - 1;
      applyStyles(wsCostos, {s:{r:pvpRow,c:0},e:{r:pvpRow,c:6}}, {fill: {fgColor:{rgb:"A9D08E"}}, font:{bold:true}});
      applyStyles(wsCostos, {s:{r:pvpRow,c:7},e:{r:pvpRow,c:7}}, stTotalRed);

      for(let r=matRow+1; r<procRow-2; r++){ applyStyles(wsCostos, {s:{r:r,c:5},e:{r:r,c:5}}, stMoney); applyStyles(wsCostos, {s:{r:r,c:7},e:{r:r,c:7}}, stMoney); }
      for(let r=procRow+1; r<totProcRow; r++){ applyStyles(wsCostos, {s:{r:r,c:5},e:{r:r,c:5}}, stMoney); applyStyles(wsCostos, {s:{r:r,c:7},e:{r:r,c:7}}, stMoney); }
      for(let r=cifStartRow+1; r<totCifRow; r++){ applyStyles(wsCostos, {s:{r:r,c:5},e:{r:r,c:5}}, stMoney); applyStyles(wsCostos, {s:{r:r,c:7},e:{r:r,c:7}}, stMoney); }

      wsCostos['!cols'] = [{wch: 20}, {wch: 35}, {wch: 25}, {wch: 10}, {wch: 10}, {wch: 15}, {wch: 10}, {wch: 15}];
      wsCostos['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:8}}, {s:{r:1,c:0},e:{r:1,c:1}}, {s:{r:2,c:0},e:{r:2,c:1}}, {s:{r:3,c:0},e:{r:3,c:1}},
        {s:{r:cifStartRow,c:1},e:{r:cifStartRow,c:4}},
        {s:{r:cifStartRow+1,c:0},e:{r:cifStartRow+12,c:0}},
        {s:{r:ptoEqRow,c:0},e:{r:ptoEqRow,c:6}}, {s:{r:pvpRow,c:0},e:{r:pvpRow,c:6}}
      ];
      XLSX.utils.book_append_sheet(wb, wsCostos, "COSTOS");

      XLSX.writeFile(wb, `Ficha_Industrial_${fullName.replace(/ /g, '_')}.xlsx`);
    } catch (error) {
      console.error("Error exporting", error);
      alert("Hubo un problema exportando a Excel.");
    }
  };

  return (
    <div className="tech-panel-content">
      {step === 'initial' && (
        <div className="panel-initial">
          <div className="panel-hero">
            <h3>{fullName}</h3>
            <p>Ingeniería de Costos y Procesos</p>
          </div>
          <div className="panel-actions">
            <button className="btn-primary-full mt-3 shadow-glow" onClick={generateTechSheet}>
              <span className="icon">✨</span> Generar Ficha Tecnica
            </button>
          </div>  
        </div>
      )}

      {step === 'analyzing' && (
        <div className="panel-analyzing">
          <div className="spinner-modern"></div>
          <p className="loading-text">{loadingText}</p>
        </div>
      )}

      {step === 'done' && techData && (
        <div className="panel-done">
          <div className="ts-header">
            <h4>FICHA INDUSTRIAL (IA)</h4>
            <div className="ts-badges">
              <button onClick={exportToExcel} className="btn-excel" title="Exportar a Excel">📊 Descargar Excel Completo</button>
            </div>
          </div>
          
          <div className="ts-tabs">
            <button className={activeTab === 'diseño' ? 'active' : ''} onClick={() => setActiveTab('diseño')}>Materiales</button>
            <button className={activeTab === 'procesos' ? 'active' : ''} onClick={() => setActiveTab('procesos')}>Procesos</button>
            <button className={activeTab === 'costos' ? 'active' : ''} onClick={() => setActiveTab('costos')}>Costos (Escandallo)</button>
          </div>

          <div className="ts-content-scroll">
            {activeTab === 'diseño' && (
              <div className="ts-panel-tab">
                <h5>Textiles y Proveedores</h5>
                <ul className="details-list">
                  <li><strong>Base:</strong> {techData.telasBase[0].ref} ({techData.telasBase[0].comp}) - {techData.telasBase[0].prov}</li>
                  <li><strong>Consumo Est.:</strong> {techData.telasBase[0].consumo} mts</li>
                </ul>
                <h5 className="mt-3">Insumos Críticos</h5>
                <table className="cost-table">
                  <tbody>
                    {techData.insumos.map((ins, idx) => (
                      <tr key={idx}><td>{ins.tipo}<br/><small>{ins.prov}</small></td><td className="amount">{ins.cant} {ins.uni}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'procesos' && (
              <div className="ts-panel-tab">
                <h5>Operaciones de Confección</h5>
                <details className="processes-dropdown" style={{marginTop: '0.5rem', marginBottom: '1rem'}}>
                  <summary style={{cursor: 'pointer', padding: '0.5rem', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', fontWeight: 'bold'}}>
                    Ver todas las operaciones ({techData.operacional.length} pasos)
                  </summary>
                  <table className="cost-table" style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>
                    <tbody>
                      {techData.operacional.map((op, idx) => (
                        <tr key={idx}><td>{idx+1}. {op.op}</td><td className="amount">{op.maq}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </details>

                <h5 className="mt-3">Acabados Estándar</h5>
                <table className="cost-table" style={{fontSize: '0.85rem'}}>
                  <tbody>
                    {techData.acabados.map((a, idx) => (
                      <tr key={'ac'+idx}><td><strong>{a.op}</strong></td><td className="amount">{a.maq}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'costos' && (
              <div className="ts-panel-tab">
                <h5>Escandallo de Costos (Prorrateo)</h5>
                <table className="cost-table">
                  <tbody>
                    <tr><td>Materiales e Insumos</td><td className="amount">{techData.costos.f_materiales}</td></tr>
                    <tr><td>Procesos, Corte y Confección</td><td className="amount">{techData.costos.f_procesos}</td></tr>
                    <tr><td>CIF (Arriendo, Servicios, SS...)</td><td className="amount">{techData.costos.f_totalCIF}</td></tr>
                    <tr className="total-row"><td>PTO EQUILIBRIO PRENDA</td><td className="amount">{techData.costos.f_ptoEquilibrio}</td></tr>
                    <tr className="sell-row"><td>PRECIO DE VENTA (Sugerido)</td><td className="amount">{techData.costos.f_sellPrice}</td></tr>
                  </tbody>
                </table>
                <div style={{fontSize: '0.8rem', color: 'var(--text)', marginTop: '0.5rem', textAlign: 'center'}}>
                  Exporta el Excel para ver el desglose completo de la Ficha de Costos Industrial.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
