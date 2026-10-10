import type { LandingCopy, LandingId } from "./landings";

// Textos de las páginas de búsqueda, en español. Mismas reglas que la versión francesa:
// ninguna cifra de mercado inventada; los temas legales y fiscales remiten al notario.

const copy: Record<LandingId, LandingCopy> = {
  vente: {
    title: "Inmuebles en venta en Marrakech: villas, casas, riads",
    description: "Villas, casas y riads en venta en Marrakech: precios indicados, fotos de los inmuebles y acompañamiento desde la visita hasta el notario.",
    eyebrow: "Comprar en Marrakech",
    h1: "Inmuebles en venta en Marrakech",
    answer: "Live In Marrakech ofrece inmuebles en venta en Marrakech y sus alrededores, según disponibilidad: villas, casas, riads. Acompañamos al comprador, residente o no en Marruecos, desde la visita hasta la firma ante notario.",
    sections: [
      {
        heading: "¿Qué tipo de inmueble comprar en Marrakech?",
        paragraphs: [
          "Depende ante todo de cómo quiera vivir la ciudad. Las villas, normalmente con jardín y piscina, están sobre todo en las afueras: la Palmeraie, la carretera de Fez, la carretera de Ourika y la de Amizmiz. Los apartamentos se concentran en barrios modernos como Gueliz, Hivernage o Agdal, y en residencias cerradas con piscina comunitaria.",
          "El riad, casa tradicional organizada alrededor de un patio, es el símbolo de la medina: ideal para vivir en el centro histórico o abrir una casa de huéspedes. El terreno permite construir a medida, siempre que se compruebe bien lo que autoriza el plan urbanístico.",
        ],
      },
      {
        heading: "Las etapas de una compra en Marruecos",
        paragraphs: [
          "Tras acordar el precio, la compra suele hacerse en dos pasos: un compromiso de venta con un anticipo y, después, la escritura definitiva. Las escrituras las redacta un notario (o los adules) y, si el inmueble tiene título, la venta se inscribe en la Conservación de la Propiedad (Conservation foncière).",
          "Antes de comprometerse, pida el certificado de propiedad del título: indica el propietario, la superficie y las posibles hipotecas o cargas. Su notario le dará un desglose escrito de los gastos (derechos de registro, conservación de la propiedad, honorarios). Dependen del inmueble y de su situación, por eso no los estimamos en su lugar.",
        ],
      },
      {
        heading: "Comprar siendo extranjero o marroquí residente en el extranjero",
        paragraphs: [
          "Por regla general, un extranjero puede comprar en Marruecos un apartamento, una villa o un riad en plena propiedad, sin necesidad de residencia. Las tierras agrícolas tienen un régimen particular que el notario debe comprobar caso por caso.",
          "Si financia la compra con fondos del extranjero, pague por vía bancaria y conserve los justificantes de transferencia de divisas: se exigen para poder repatriar el capital en una futura venta. Su banco y su notario le indicarán las normas vigentes.",
        ],
      },
      {
        heading: "Cómo trabajamos",
        paragraphs: [
          "Cada anuncio muestra las fotos del inmueble y su precio. Puede organizar una visita por WhatsApp, en persona o por vídeo, y después preparamos el expediente con su notario hasta la entrega de llaves.",
          "¿No encuentra el inmueble adecuado? Indíquenos presupuesto, barrio y número de habitaciones, y le enviaremos una selección, incluidos inmuebles que aún no están publicados.",
        ],
      },
    ],
    faq: [
      { q: "¿Puede un extranjero comprar un inmueble en Marrakech?", a: "Sí. Por regla general, un extranjero puede comprar un apartamento, una villa o un riad en plena propiedad, sin permiso de residencia. Las tierras agrícolas tienen un régimen particular: hágalo comprobar por un notario." },
      { q: "¿Quién redacta la escritura de compraventa en Marruecos?", a: "Un notario o los adules. Si el inmueble tiene título, la venta se inscribe después en la Conservación de la Propiedad, lo que oficializa la transmisión." },
      { q: "¿Cuánto cuestan los gastos de compra?", a: "Principalmente los derechos de registro, los gastos de conservación de la propiedad y los honorarios del notario. El importe depende del precio y del tipo de inmueble: pida un desglose escrito a su notario antes de firmar." },
      { q: "¿Se puede visitar a distancia?", a: "Sí. Hacemos una visita en vídeo en directo por WhatsApp y después organizamos la visita presencial cuando venga a Marrakech." },
      { q: "¿El precio publicado es negociable?", a: "Es el precio que pide el propietario. A veces hay margen de negociación; le aconsejamos tras la visita según el inmueble y el mercado del barrio." },
    ],
    areas: ["Palmeraie", "Gueliz", "Hivernage", "Medina", "Route de l'Ourika", "Route de Fes", "Agdal"],
  },

  "vente-villas": {
    title: "Villa en venta en Marrakech con piscina y jardín",
    description: "Villas en venta en Marrakech, en la carretera de Fez y la de Sidi Rahal: piscina, jardín, fotos y precio indicados en cada anuncio.",
    eyebrow: "Venta · Villas",
    h1: "Villas en venta en Marrakech",
    answer: "Nuestras villas en venta en Marrakech están en las afueras de la ciudad, en la carretera de Fez y la carretera de Sidi Rahal, con jardín y piscina privada. Cada anuncio muestra el precio, las fotos y las superficies.",
    sections: [
      {
        heading: "¿Dónde comprar una villa en Marrakech?",
        paragraphs: [
          "La Palmeraie, al noreste de la ciudad, es la dirección histórica de las grandes villas: jardines frondosos, tranquilidad, campos de golf cercanos y acceso rápido al centro. La carretera de Fez continúa en la misma línea, con grandes fincas de varios miles de metros cuadrados.",
          "Al este, la carretera de Sidi Rahal ofrece villas tranquilas, sin vecinos a la vista, algunas con vistas panorámicas al Atlas.",
        ],
      },
      {
        heading: "Qué revisar durante la visita",
        paragraphs: [
          "Más allá del flechazo, compruebe la situación jurídica (título de propiedad, superficie del terreno, construcciones conformes a la licencia), el acceso en coche todo el año, el suministro de agua (red o pozo) y el estado de la piscina y de la instalación eléctrica.",
          "Piense también en el mantenimiento: jardín, piscina, vigilancia. En una gran propiedad, ese presupuesto anual cuenta tanto como el precio de compra. Le transmitimos toda la información del propietario y le ayudamos a hacer las preguntas correctas.",
        ],
      },
      {
        heading: "Comprar para vivir o para alquilar",
        paragraphs: [
          "Muchos compradores combinan ambas cosas: ocupan la villa parte del año y la alquilan el resto. Algunas villas de nuestro catálogo se ofrecen a la vez en venta y en alquiler. Si piensa en el alquiler vacacional, infórmese sobre las autorizaciones y la fiscalidad antes de comprar.",
        ],
      },
    ],
    faq: [
      { q: "¿En qué barrio comprar una villa en Marrakech?", a: "Nuestras villas en venta están en la carretera de Fez para grandes propiedades tranquilas, y en la carretera de Sidi Rahal para vistas al Atlas sin vecinos a la vista. La lista de arriba muestra los inmuebles disponibles hoy." },
      { q: "¿Las villas se venden amuebladas?", a: "Depende del propietario. Algunas se venden amuebladas y equipadas, otras vacías; se indica en cada ficha o se confirma a petición." },
      { q: "¿Qué documentos revisar antes de comprar una villa?", a: "El certificado de propiedad del título, el plano catastral, la licencia de obra y el permiso de habitar, y que no haya hipoteca. Su notario controla estos documentos antes de la firma." },
      { q: "¿Puedo alquilar mi villa cuando no la uso?", a: "Sí. El alquiler de larga duración es el más sencillo. El alquiler vacacional requiere autorizaciones y declarar los ingresos: infórmese antes de comprar." },
      { q: "¿Cómo visitar una villa desde el extranjero?", a: "Organizamos una visita en vídeo en directo por WhatsApp y le enviamos los documentos disponibles; después, una visita presencial durante su estancia." },
    ],
    areas: ["Palmeraie", "Route de Fes", "Route de l'Ourika", "Route d'Amizmiz", "Hivernage", "Targa", "Agdal"],
  },

  "vente-appartements": {
    title: "Apartamento en venta en Marrakech",
    description: "¿Busca comprar un apartamento en Marrakech? Indíquenos su presupuesto y barrio y le enviaremos una selección a medida.",
    eyebrow: "Venta · Apartamentos",
    h1: "Apartamentos en venta en Marrakech",
    answer: "Los apartamentos en venta en Marrakech se encuentran sobre todo en Gueliz, Hivernage y Agdal, y en residencias cerradas con piscina en las afueras. Por regla general, un extranjero puede comprar un apartamento en plena propiedad.",
    sections: [
      {
        heading: "Barrios para comprar un apartamento",
        paragraphs: [
          "Gueliz, la ciudad nueva, reúne comercios, cafés, restaurantes y servicios: la opción para quien quiere hacerlo todo a pie. Hivernage, entre Gueliz y la medina, es más residencial y de alto standing, con numerosos hoteles y edificios recientes.",
          "Agdal, al sur de la medina, y barrios como Targa o Chrifia ofrecen residencias más recientes, a menudo cerradas y vigiladas, con piscina comunitaria y aparcamiento. Los precios suelen ser más accesibles que en el centro.",
        ],
      },
      {
        heading: "Obra nueva, sobre plano o segunda mano",
        paragraphs: [
          "En la compra sobre plano (VEFA), los pagos se escalonan según el avance de la obra. Compruebe la reputación del promotor, las garantías del contrato y la fecha de entrega. En segunda mano, fíjese en el estado del edificio, los gastos de comunidad y el reglamento de la residencia.",
          "En todos los casos, pida el título de propiedad del apartamento (cada unidad suele tener el suyo) y la situación de la administración de la comunidad. Su notario lo comprueba antes de la escritura definitiva.",
        ],
      },
      {
        heading: "Vivir o invertir",
        paragraphs: [
          "Un apartamento bien situado se alquila fácilmente todo el año a profesionales, estudiantes o expatriados; suele ser la inversión más sencilla de gestionar a distancia. También podemos ayudarle a encontrar inquilino una vez hecha la compra.",
        ],
      },
    ],
    faq: [
      { q: "¿Cuál es el mejor barrio para comprar un apartamento en Marrakech?", a: "Gueliz por la vida de barrio y los comercios, Hivernage por el standing y la tranquilidad, Agdal o Targa por residencias recientes con piscina a precios a menudo más accesibles." },
      { q: "¿Puede un extranjero comprar un apartamento en Marrakech?", a: "Sí. Por regla general, un extranjero puede comprar un apartamento en plena propiedad, sin obligación de residencia. El notario revisa el expediente antes de la firma." },
      { q: "¿Qué es la VEFA (compra sobre plano)?", a: "La compra de una vivienda antes de construirse. El precio se paga por etapas según el avance de la obra, y el contrato debe precisar las garantías y la fecha de entrega." },
      { q: "¿Hay gastos de comunidad?", a: "Sí, la mayoría de las residencias tienen una administración que gestiona el mantenimiento, la seguridad y la piscina. Pida el importe anual antes de hacer una oferta." },
      { q: "¿Se puede comprar un apartamento para alquilarlo?", a: "Sí. El alquiler de larga duración es el más sencillo de gestionar. Para el alquiler de corta duración, compruebe las autorizaciones y el reglamento de la residencia, que puede prohibirlo." },
    ],
    areas: ["Gueliz", "Hivernage", "Agdal", "Targa", "Chrifia"],
  },

  "vente-riads": {
    title: "Riad en venta en Marrakech con piscina",
    description: "Riad en venta en Marrakech con piscina y patio. Título de propiedad, acceso, obras: qué comprobar antes de comprar un riad.",
    eyebrow: "Venta · Riads",
    h1: "Riads en venta en Marrakech",
    answer: "Un riad es una casa tradicional marroquí organizada alrededor de un patio interior, a menudo con fuente o piscina. Antes de comprar, compruebe sobre todo que el riad tiene título de propiedad y revise después el acceso en coche y el estado de la estructura.",
    sections: [
      {
        heading: "Vivir en un riad",
        paragraphs: [
          "Tras una fachada discreta, el riad se abre a un patio con plantas, a veces con piscina, al que dan los salones y los dormitorios. Una azotea suele completar la casa. Es un modo de vida volcado hacia el interior, tranquilo e íntimo.",
          "Visite el riad a distintas horas del día para valorar la luz, el ruido y el acceso, que cambian mucho de un riad a otro.",
        ],
      },
      {
        heading: "Qué comprobar antes de comprar",
        paragraphs: [
          "La situación jurídica es esencial. Algunos inmuebles antiguos siguen en régimen de « melkia » (acta adular tradicional), sin título de propiedad. Dé prioridad a un riad con título, o pida a su notario que tramite la inscripción antes de la venta.",
          "Revise también el acceso en coche, la estructura, la humedad y la impermeabilización de la azotea. Las obras en este tipo de construcción pueden requerir autorización: infórmese antes de comprar un riad para reformar.",
        ],
      },
      {
        heading: "Vivienda privada o casa de huéspedes",
        paragraphs: [
          "Muchos riads funcionan como casas de huéspedes. Si es su proyecto, la explotación turística exige autorizaciones y una clasificación específicas: compruebe si el riad ya las tiene y qué haría falta para obtenerlas.",
        ],
      },
    ],
    faq: [
      { q: "¿Qué es un riad?", a: "Una casa tradicional marroquí construida alrededor de un patio interior, a menudo con plantas, con las estancias abiertas a ese patio y una azotea." },
      { q: "¿Por qué es tan importante el título de propiedad en un riad?", a: "El título garantiza la propiedad y la superficie, inscritas en la Conservación de la Propiedad. Un inmueble solo con « melkia » es más arriesgado y hay que inscribirlo, lo que lleva tiempo." },
      { q: "¿Puede un extranjero comprar un riad?", a: "Sí. Por regla general, un extranjero puede comprar un riad en plena propiedad. El notario comprueba la situación del inmueble y el origen de la propiedad antes de la firma." },
      { q: "¿Se puede reformar un riad libremente?", a: "No siempre: las obras pueden requerir autorización y deben respetar el carácter de la construcción. Infórmese antes de comprar si el riad necesita reformas." },
      { q: "¿Se puede convertir un riad en casa de huéspedes?", a: "Sí, pero la actividad turística requiere autorizaciones y una clasificación. Compruebe si el riad ya funciona legalmente o qué haría falta." },
    ],
    areas: [],
  },

  "vente-maisons": {
    title: "Casa en venta en Marrakech",
    description: "Casas en venta en Marrakech y alrededores, como una casa tradicional con jardín en Ennakhil (Palmeraie). Visita en persona o por vídeo.",
    eyebrow: "Venta · Casas",
    h1: "Casas en venta en Marrakech",
    answer: "En Marrakech, las casas en venta son viviendas unifamiliares más sencillas o más compactas que una villa: casas con jardín en las afueras, como en la Palmeraie, o casas urbanas en barrios residenciales.",
    sections: [
      {
        heading: "¿Casa o villa? La diferencia",
        paragraphs: [
          "« Villa » designa en general una vivienda unifamiliar de alto standing, en una parcela más grande y a menudo con piscina. « Casa » abarca inmuebles más variados: casas con jardín sin piscina, casas urbanas de dos o tres plantas, viviendas en conjuntos residenciales.",
          "Con el mismo presupuesto, una casa suele ofrecer más superficie habitable que una villa en la misma zona, con un mantenimiento más razonable.",
        ],
      },
      {
        heading: "Qué comprobar",
        paragraphs: [
          "Como en cualquier compra: título de propiedad, construcciones conformes a la licencia, ausencia de hipoteca. En una casa con jardín, revise el suministro de agua y la orientación; en una casa urbana, el vecindario y el aparcamiento.",
          "Si piensa ampliar o construir una piscina, pregunte primero qué permite la normativa urbanística de la zona.",
        ],
      },
    ],
    faq: [
      { q: "¿Qué diferencia hay entre una casa y una villa en Marrakech?", a: "La villa suele ser más grande, con una parcela mayor y a menudo con piscina. La casa abarca viviendas unifamiliares más sencillas o compactas, con o sin jardín." },
      { q: "¿Se puede añadir una piscina a una casa?", a: "A menudo sí, pero depende del terreno y de la normativa urbanística. Pida una nota de información urbanística antes de planificar obras." },
      { q: "¿Puede un extranjero comprar una casa en Marrakech?", a: "Sí, por regla general, salvo tierras agrícolas. El notario comprueba la situación del inmueble antes de la firma." },
      { q: "¿Tienen casas que no están publicadas?", a: "Sí, algunos propietarios prefieren la discreción. Describa su búsqueda y le enviaremos los inmuebles que encajen." },
    ],
    areas: ["Palmeraie", "Targa", "Agdal", "Route de l'Ourika"],
  },

  "vente-terrains": {
    title: "Terreno en venta en Marrakech",
    description: "Comprar un terreno en Marrakech: nota urbanística, título de propiedad, servicios. Describa su proyecto y buscaremos por usted.",
    eyebrow: "Venta · Terrenos",
    h1: "Terrenos en venta en Marrakech",
    answer: "Comprar un terreno en Marrakech permite construir una villa a medida. Antes de cualquier compra, pida a la Agencia Urbana la nota de información urbanística para saber qué se puede construir, y compruebe el título de propiedad. Las tierras agrícolas tienen un régimen particular para los compradores extranjeros.",
    sections: [
      {
        heading: "Dónde encontrar terreno alrededor de Marrakech",
        paragraphs: [
          "Las grandes parcelas están en las afueras: la Palmeraie y las carreteras de Fez, Ourika y Amizmiz. Más cerca de la ciudad, las urbanizaciones ofrecen parcelas ya urbanizadas, de tamaño más modesto, con normas de construcción precisas.",
        ],
      },
      {
        heading: "Comprobaciones imprescindibles",
        paragraphs: [
          "La nota de información urbanística (note de renseignements urbanistiques), emitida por la Agencia Urbana de Marrakech, indica la zona del terreno y lo que está permitido: altura, superficie edificable, retranqueos, uso. Sin ella, no se puede saber si su proyecto es viable.",
          "Compruebe también el título de propiedad y el deslinde, el acceso por un camino y los servicios: agua, electricidad, saneamiento. Conectar un terreno aislado puede ser caro y lento.",
          "Para un comprador extranjero, la adquisición de tierras de vocación agrícola está regulada: según el terreno, puede ser necesario un certificado de vocación no agrícola. Hágalo comprobar por un notario antes de comprometerse.",
        ],
      },
      {
        heading: "Construir su casa",
        paragraphs: [
          "Una vez comprado el terreno, el proyecto pasa por un arquitecto y una solicitud de licencia de obra. Tenga en cuenta el plazo de los estudios y las autorizaciones en su calendario. Podemos ponerle en contacto con profesionales locales.",
        ],
      },
    ],
    faq: [
      { q: "¿Qué es la nota de información urbanística?", a: "Un documento emitido por la Agencia Urbana que indica la zona de un terreno y las normas de construcción aplicables. Es el primer documento que hay que pedir antes de comprar." },
      { q: "¿Puede un extranjero comprar un terreno en Marruecos?", a: "Un terreno edificable en zona urbana, sí por regla general. Las tierras agrícolas tienen un régimen particular para los extranjeros: un notario debe comprobar cada caso." },
      { q: "¿Qué es un terreno urbanizado?", a: "Un terreno conectado, o listo para conectarse, a caminos, agua, electricidad y saneamiento. Un terreno sin urbanizar cuesta menos pero requiere obras de conexión." },
      { q: "¿Cuánto tarda una licencia de obra?", a: "Depende del proyecto y del municipio. Cuente con varios meses entre los estudios del arquitecto y la obtención de la licencia." },
    ],
    areas: ["Palmeraie", "Route de Fes", "Route de l'Ourika", "Route d'Amizmiz"],
  },

  location: {
    title: "Alquiler de larga duración en Marrakech: villas y pisos",
    description: "Villas y pisos en alquiler de larga duración en Marrakech, amueblados o no: contrato de 1 año, alquiler mensual indicado, visita o vídeo.",
    eyebrow: "Alquilar por años",
    h1: "Alquiler de larga duración en Marrakech",
    answer: "Live In Marrakech alquila por años villas y pisos en Marrakech y alrededores, amueblados o sin amueblar, para expatriados, familias, jubilados, teletrabajadores y residentes marroquíes o marroquíes residentes en el extranjero. El contrato es de un año como mínimo, el alquiler mensual figura en cada anuncio y basta con un pasaporte o un documento de identidad. Puede visitar en persona o por vídeo en WhatsApp.",
    sections: [
      {
        heading: "Alquilar un apartamento o una villa",
        paragraphs: [
          "Los apartamentos se alquilan sobre todo en Gueliz, Hivernage, Agdal y en residencias cerradas con piscina. Son ideales para profesionales, parejas y quien quiere estar cerca de los comercios.",
          "Las villas, normalmente en las afueras, ofrecen jardín, piscina y tranquilidad: atraen a familias y a quienes teletrabajan. En ese caso necesitará coche para el día a día.",
        ],
      },
      {
        heading: "Cómo funciona un alquiler de larga duración",
        paragraphs: [
          "Tras la visita, propietario e inquilino firman un contrato escrito; los arrendamientos de vivienda se rigen por la Ley n.º 67-12. La fianza (un mes de alquiler en nuestros inmuebles) y la primera mensualidad se pagan a la firma.",
          "Tenga preparados su pasaporte o documento de identidad y justificantes de ingresos. Se hace un inventario de entrada y de salida, idealmente con fotos.",
        ],
      },
      {
        heading: "Amueblado o vacío",
        paragraphs: [
          "La mayoría de los expatriados elige una vivienda amueblada para instalarse rápido. El alquiler vacío suele ser más barato y conviene a quien se queda varios años con sus muebles. Cada ficha detalla el equipamiento; pídanos el inventario completo si lo necesita.",
        ],
      },
    ],
    faq: [
      { q: "¿Qué documentos se necesitan para alquilar en Marrakech?", a: "Un documento de identidad o pasaporte y, en general, justificantes de ingresos o un aval. El propietario puede pedir documentos adicionales." },
      { q: "¿Cuánto es la fianza?", a: "En nuestros inmuebles, la fianza es de un mes de alquiler, amueblado o sin amueblar. Se indica en el contrato." },
      { q: "¿Los suministros están incluidos en el alquiler?", a: "Depende del inmueble. Agua, electricidad e internet suelen correr a cargo del inquilino; los gastos de la residencia pueden estar incluidos o no. La ficha o el contrato lo precisan." },
      { q: "¿Se puede alquilar a distancia antes de llegar a Marruecos?", a: "Sí. Hacemos una visita en vídeo por WhatsApp y preparamos el contrato; la firma y el inventario se hacen a su llegada." },
      { q: "¿Cuánto dura un contrato de larga duración?", a: "Lo más habitual es un año renovable, pero se pueden acordar otras duraciones con el propietario." },
    ],
    areas: ["Gueliz", "Hivernage", "Agdal", "Palmeraie", "Targa", "Route de Fes", "Route de l'Ourika"],
  },

  "location-appartements": {
    title: "Alquiler de pisos en Marrakech por años, amueblados o no",
    description: "Pisos en alquiler de larga duración en Marrakech, en Chrifia o en el golf Prestigia: alquiler mensual indicado, contrato de 1 año.",
    eyebrow: "Larga duración · Apartamentos",
    h1: "Apartamentos en alquiler de larga duración en Marrakech",
    answer: "Live In Marrakech ofrece pisos en alquiler de larga duración en Marrakech, para expatriados, parejas, teletrabajadores y residentes marroquíes o marroquíes residentes en el extranjero que buscan una vivienda práctica para el día a día. El contrato es de un año como mínimo, el alquiler mensual figura en cada anuncio y basta con un pasaporte o un documento de identidad. Puede visitar en persona o por vídeo en WhatsApp.",
    sections: [
      {
        heading: "¿En qué barrio alquilar?",
        paragraphs: [
          "Gueliz es el centro moderno: comercios, cafés, restaurantes, gimnasios y servicios a pie. Hivernage es más tranquilo y residencial, a medio camino entre Gueliz y la medina. Agdal, más al sur, ofrece residencias recientes con aparcamiento y piscina.",
          "Barrios como Targa o Chrifia suelen tener alquileres más bajos, a cambio de trayectos algo más largos al centro. Las residencias cerradas de las afueras atraen a las familias por sus zonas verdes y su vigilancia.",
        ],
      },
      {
        heading: "Apartamento amueblado por años",
        paragraphs: [
          "Un apartamento amueblado permite mudarse con una maleta: cocina equipada, ropa de cama, electrodomésticos. Es la opción más habitual para expatriados y personas con misiones de meses o años.",
          "Durante la visita, revise el mobiliario y los electrodomésticos, compruebe el aire acondicionado y la calefacción (las noches de invierno son frescas en Marrakech) y la conexión a internet si trabaja desde casa.",
        ],
      },
      {
        heading: "Contrato y gastos",
        paragraphs: [
          "El contrato escrito fija el alquiler, la duración, la fianza y el reparto de gastos. Agua, electricidad e internet suelen correr a cargo del inquilino; los gastos de la residencia (administración, vigilancia, piscina) pueden estar incluidos o no en el alquiler.",
        ],
      },
    ],
    faq: [
      { q: "¿Qué barrio elegir para alquilar un apartamento en Marrakech?", a: "Gueliz para hacerlo todo a pie, Hivernage por la tranquilidad y el standing, Agdal por residencias recientes con piscina, Targa o Chrifia por alquileres a menudo más accesibles." },
      { q: "¿Se puede alquilar un apartamento amueblado por un año?", a: "Sí, es la fórmula más habitual para expatriados. Cada ficha indica su equipamiento y podemos enviarle el inventario del mobiliario." },
      { q: "¿El alquiler indicado incluye los gastos?", a: "El alquiler indicado es mensual. Los gastos de la residencia pueden estar incluidos o no; agua, electricidad e internet suelen ir aparte. Se precisa antes de firmar el contrato." },
      { q: "¿Necesito coche si vivo en Gueliz?", a: "No necesariamente: Gueliz y Hivernage se viven bien a pie y en taxi. En las afueras, el coche se vuelve casi imprescindible." },
      { q: "¿Cuánto se tarda en encontrar un apartamento?", a: "Si un inmueble del catálogo le conviene, la visita puede hacerse en pocos días. Si no, describa su búsqueda y le enviaremos una selección." },
    ],
    areas: ["Gueliz", "Hivernage", "Agdal", "Targa", "Chrifia"],
  },

  "location-villas": {
    title: "Alquiler de villas en Marrakech por años, con piscina",
    description: "Villas con piscina en alquiler de larga duración en Marrakech, carretera de Fez y de Sidi Rahal: alquiler mensual indicado, contrato de 1 año.",
    eyebrow: "Larga duración · Villas",
    h1: "Villas en alquiler de larga duración en Marrakech",
    answer: "Live In Marrakech alquila por años villas con jardín y piscina alrededor de Marrakech, para familias, jubilados, teletrabajadores y residentes marroquíes o marroquíes residentes en el extranjero que buscan espacio y calma. El contrato es de un año como mínimo, el alquiler mensual figura en cada anuncio y basta con un pasaporte o un documento de identidad. Puede visitar en persona o por vídeo en WhatsApp.",
    sections: [
      {
        heading: "¿Dónde alquilar una villa en Marrakech?",
        paragraphs: [
          "La Palmeraie combina grandes jardines, tranquilidad y cercanía a la ciudad. La carretera de Fez ofrece grandes fincas, a veces de varias hectáreas. Al sur, las carreteras de Ourika y de Amizmiz ofrecen villas recientes con vistas al Atlas.",
          "Cuanto más lejos del centro, más espacio… y más imprescindible es el coche: piense en los trayectos al colegio, al trabajo o al aeropuerto.",
        ],
      },
      {
        heading: "Qué incluye el alquiler de una villa",
        paragraphs: [
          "Según la propiedad, el mantenimiento del jardín y la piscina, la vigilancia o el personal doméstico pueden estar incluidos en el alquiler o correr a su cargo. Hágalo constar en el contrato, igual que el reparto de las facturas de agua y electricidad, que pueden ser elevadas con piscina.",
          "Compruebe también la calefacción para el invierno, el aire acondicionado para el verano y la conexión a internet si trabaja desde casa.",
        ],
      },
      {
        heading: "¿Para quién?",
        paragraphs: [
          "Familias que se instalan, jubilados, emprendedores y teletrabajadores: la villa alquilada por años ofrece una calidad de vida difícil de encontrar en un apartamento. Algunas villas de nuestro catálogo también están en venta, por si piensa comprar más adelante.",
        ],
      },
    ],
    faq: [
      { q: "¿En qué barrio alquilar una villa de larga duración?", a: "La Palmeraie por la tranquilidad cerca de la ciudad, la carretera de Fez por las grandes fincas, las carreteras de Ourika y Amizmiz por villas recientes con vistas al Atlas." },
      { q: "¿Está incluido el mantenimiento de la piscina y el jardín?", a: "Depende de la villa. Puede estar incluido en el alquiler o correr a cargo del inquilino: el contrato lo precisa." },
      { q: "¿Las villas se alquilan amuebladas?", a: "La mayoría sí, pero algunas pueden alquilarse vacías. Se indica en la ficha o lo confirmamos a petición." },
      { q: "¿Necesito coche?", a: "Sí, para la mayoría de las villas de las afueras. Los trayectos al centro suelen durar entre 15 y 30 minutos según la zona y el tráfico." },
      { q: "¿Se puede alquilar una villa y comprarla después?", a: "A veces, cuando el propietario está dispuesto a vender. Algunas villas de nuestro catálogo se ofrecen a la vez en alquiler y en venta." },
    ],
    areas: ["Palmeraie", "Route de Fes", "Route de l'Ourika", "Route d'Amizmiz", "Targa"],
  },
};

export default copy;
