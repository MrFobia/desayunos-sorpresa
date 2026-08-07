/**
 * Paleta de los materiales WebGL.
 *
 * Las variables de tokens.css están en OKLCH y three.js no parsea OKLCH,
 * así que la escena tiene su propia paleta en sRGB. Los tonos se derivan de
 * los mismos anclajes del sistema (fresa 25°, hoja 145°, crema 70°) para que
 * el hero no se despegue del resto de la página.
 */
export const FRUIT = {
  strawberry: '#c8402f',
  strawberrySeed: '#f2d9a8',
  leaf: '#4e7c46',
  blueberry: '#3b3f7a',
  blueberryBloom: '#6d74b8',
  kiwiFlesh: '#8fae4b',
  kiwiCore: '#f0edd6',
  kiwiSkin: '#7b6242',
  orange: '#e08a2c',
  bowl: '#efe2cf',
  bowlRim: '#e0cdb2',
  cream: '#faf3ea',
};
