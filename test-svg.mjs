import { designs } from '@freesewing/collection';
const Aaron = designs.aaron;
const p = new Aaron();
p.draft();
const svg = p.render();
console.log(svg.substring(0, 1500));
