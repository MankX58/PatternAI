import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public/assets');
const PATTERNS_DIR = path.join(PUBLIC_DIR, 'patterns');
const IMG_DIR = path.join(PUBLIC_DIR, 'img');
const DATA_FILE = path.join(__dirname, '../src/data/patrones.json');

// Asegurar que los directorios existen
[PATTERNS_DIR, IMG_DIR, path.dirname(DATA_FILE)].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function run() {
  console.log("Buscando patrones en GitHub...");
  try {
    const { data } = await axios.get('https://api.github.com/search/repositories?q=seamly2d+pattern&per_page=6', {
      headers: {
        'User-Agent': 'Node Script'
      }
    });
    const repos = data.items;
    
    let catalog = [];

    for (const repo of repos) {
      console.log(`Procesando repositorio: ${repo.name}`);
      const patternId = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      const patternFileName = `${patternId}.val`;
      const patternFilePath = path.join(PATTERNS_DIR, patternFileName);
      fs.writeFileSync(patternFilePath, `<!-- Archivo Seamly2D Ficticio para ${repo.name} -->`);

      const imgFileName = `${patternId}.jpg`;
      const imgFilePath = path.join(IMG_DIR, imgFileName);
      
      try {
        const imgResponse = await axios.get(repo.owner.avatar_url, { responseType: 'stream' });
        const writer = fs.createWriteStream(imgFilePath);
        imgResponse.data.pipe(writer);
        await new Promise((resolve) => writer.on('finish', resolve));
      } catch (err) {
        console.log(`No se pudo descargar imagen para ${repo.name}`);
      }

      catalog.push({
        id: patternId,
        nombre: repo.name.replace(/-/g, ' ').toUpperCase(),
        categoria: "CÓDIGO ABIERTO",
        autor: repo.owner.login,
        descripcion: repo.description || "Patrón de costura open-source extraído de GitHub.",
        urls: {
          github: repo.html_url,
          archivo: `/assets/patterns/${patternFileName}`,
          imagen: `/assets/img/${imgFileName}`
        }
      });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(catalog, null, 2));
    console.log("¡Catálogo generado exitosamente en src/data/patrones.json!");

  } catch (error) {
    console.error("Error al obtener datos de GitHub:", error.message);
  }
}

run();
