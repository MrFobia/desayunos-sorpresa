import { useEffect, useRef } from 'react';

/**
 * Revela un bloque al entrar en pantalla, una sola vez.
 *
 * A prueba de fallos: el contenido **arranca visible**. Sólo se oculta si al
 * montar está fuera de la ventana y el navegador soporta IntersectionObserver.
 * Si el observador nunca dispara —JS lento, contenido ya visible, un motor
 * viejo— el usuario ve el contenido igual. Un efecto de entrada jamás puede
 * ser la razón por la que una página aparece en blanco.
 *
 * El estado vive en un atributo del DOM, no en React: no re-renderiza al
 * hacer scroll.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    const box = node.getBoundingClientRect();
    const alreadyVisible = box.top < window.innerHeight * 0.92;
    if (alreadyVisible) return undefined;

    node.dataset.armed = 'true';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.shown = 'true';
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );

    observer.observe(node);

    // Red de seguridad: si en 3 s no disparó, se muestra igual.
    const failsafe = window.setTimeout(() => {
      node.dataset.shown = 'true';
    }, 3000);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
