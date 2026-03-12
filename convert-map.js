const fs = require('fs');
const d3 = require('d3-geo');

const geojson = JSON.parse(fs.readFileSync('./src/lib/malaysia.json', 'utf8'));

// Project the GeoJSON to a local coordinate system (Mercator works for Malaysia)
const projection = d3.geoMercator()
  .fitSize([1000, 450], geojson); // Fit into a 1000x450 aspect ratio

const pathGenerator = d3.geoPath().projection(projection);

const states = geojson.features.map(feature => {
  return {
    name: feature.properties.name,
    path: pathGenerator(feature)
  };
});

let output = 'export const MALAYSIA_SVG_PATHS = [\n';
states.forEach(state => {
  output += `  { name: "${state.name}", path: "${state.path}" },\n`;
});
output += '];\n';

fs.writeFileSync('./src/lib/malaysia-paths.ts', output);
console.log('Conversion complete!');
