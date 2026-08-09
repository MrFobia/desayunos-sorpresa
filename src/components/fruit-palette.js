/**
 * Paleta de los materiales WebGL.
 *
 * Las variables de tokens.css están en OKLCH y three.js no parsea OKLCH,
 * así que la escena tiene su propia paleta en sRGB. Los tonos se derivan de
 * los mismos anclajes del sistema (fresa 25°, hoja 145°, crema 70°) para que
 * el hero no se despegue del resto de la página.
 */
/* Tonos desaturados y algo más oscuros que la versión anterior: los colores
   vivos hacían que las frutas leyeran como juguetes de plástico. */
export const FRUIT = {
  strawberry: '#a8362c',
  strawberrySeed: '#e3cfa4',
  leaf: '#5c6f48',
  blueberry: '#3a3e5c',
  blueberryBloom: '#6b7093',
  kiwiFlesh: '#8a9a56',
  kiwiCore: '#e8e4d2',
  kiwiSkin: '#6f5c43',
  orange: '#c9832f',
  bowl: '#e8ddcb',
  bowlRim: '#d9c8ae',
  cream: '#f7f1e7',
};
