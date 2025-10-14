import React, { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

// Sample data structure - replace with your actual JSON
const sampleWords = [
  {
    original: "cambio",
    translation: "Wechsel / Wandel",
    gender: "m",
    number: "sing",
    definitions: [
      "Acción y efecto de cambiar",
      "Variación de estado, condición o propiedad",
      "Dinero extranjero en transacción",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "caminar",
    translation: "gehen / wandern",
    gender: "-",
    number: "-",
    definitions: ["Andar a pie", "Transitar despacio, moverse con paso normal"],
    type: "verbo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "cantar",
    translation: "singen",
    gender: "-",
    number: "-",
    definitions: [
      "Producir sonidos musicales con la voz",
      "Expresar algo con poesía, música o melodía",
    ],
    type: "verbo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "capturar",
    translation: "fangen / erfassen",
    gender: "-",
    number: "-",
    definitions: [
      "Hacer preso, prender",
      "Tomar, captar (imagen, sonido)",
      "Aprehender",
    ],
    type: "verbo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "carro",
    translation: "Wagen / Auto",
    gender: "m",
    number: "sing",
    definitions: [
      "Vehículo de ruedas para transporte terrestre",
      "Carreta, vehículo ligero tirado por animales",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "casa",
    translation: "Haus",
    gender: "f",
    number: "sing",
    definitions: [
      "Edificio destinado a vivienda",
      "Hogar, lugar de residencia",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "caso",
    translation: "Fall / Fall (Sache)",
    gender: "m",
    number: "sing",
    definitions: [
      "Suceso, acontecimiento",
      "Situación, circunstancia",
      "Instancia de algo",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "causa",
    translation: "Ursache / Grund",
    gender: "f",
    number: "sing",
    definitions: [
      "Motivo por el cual sucede algo",
      "Razón, razón principal de algo",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "cautela",
    translation: "Vorsicht / Umsicht",
    gender: "f",
    number: "sing",
    definitions: [
      "Precaución, cuidado",
      "Actuar con reserva para evitar daños",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "cebolla",
    translation: "Zwiebel",
    gender: "f",
    number: "sing",
    definitions: [
      "Bulbo comestible de la familia de las liliáceas",
      "Ingrediente común en cocina",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "celebrar",
    translation: "feiern",
    gender: "-",
    number: "-",
    definitions: ["Festejar, conmemorar", "Realizar actos con motivo de algo"],
    type: "verbo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "cemento",
    translation: "Zement",
    gender: "m",
    number: "sing",
    definitions: [
      "Material aglutinante usado en construcción",
      "Polvo gris que, al mezclarse con agua, fragua",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "cena",
    translation: "Abendessen",
    gender: "f",
    number: "sing",
    definitions: [
      "Comida que se hace por la noche",
      "Momento de alimentación vespertina",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "cerrar",
    translation: "schließen / zumachen",
    gender: "-",
    number: "-",
    definitions: [
      "Hacer que algo deje de estar abierto",
      "Terminar algo, concluir",
    ],
    type: "verbo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "certeza",
    translation: "Gewissheit / Sicherheit",
    gender: "f",
    number: "sing",
    definitions: ["Seguridad, convicción firme", "Ausencia de duda"],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "cielo",
    translation: "Himmel",
    gender: "m",
    number: "sing",
    definitions: [
      "Espacio que aparece sobre la tierra; atmósfera visible",
      "Suma en que se valora lo que se pagan las cuentas (cielo contable, figuradamente)",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "cierta",
    translation: "gewisse / gewisse",
    gender: "f",
    number: "sing",
    definitions: [
      "Indefinida, no especificada completamente",
      "Que tiene seguridad",
    ],
    type: "adjetivo / pronombre",
    observations: "Forma femenina – también “cierto” (m)",
    dateAdded: "2025-10-14",
  },
  {
    original: "cierto",
    translation: "gewiss / richtig",
    gender: "m",
    number: "sing",
    definitions: ["Que es verdad; verdadero", "Determinado, definido"],
    type: "adjetivo / pronombre",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "circular",
    translation: "zirkulieren / kreisförmig",
    gender: "-",
    number: "-",
    definitions: [
      "Moverse en forma de circunferencia",
      "Difundir, dar a conocer algo",
      "Que tiene forma de círculo",
    ],
    type: "verbo / adjetivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "cisne",
    translation: "Schwan",
    gender: "m",
    number: "sing",
    definitions: [
      "Ave acuática de cuello largo y plumaje blanco",
      "Metáfora de la elegancia",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "ciudad",
    translation: "Stadt",
    gender: "f",
    number: "sing",
    definitions: [
      "Concentración de población, núcleo urbano",
      "Municipio grande y con servicios",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "amor",
    translation: "Liebe",
    gender: "m",
    number: "sing",
    definitions: [
      // definiciones de RAE / DLE
      "Sentimiento intenso del ser humano que, partiendo de su propia insuficiencia, necesita y busca el encuentro y unión con otro ser", // RAE :contentReference[oaicite:0]{index=0}
      "Sentimiento hacia otra persona que naturalmente nos atrae y que, procurando reciprocidad en el deseo de unión, nos completa, alegra y da energía para convivir, comunicarnos y crear", // RAE :contentReference[oaicite:1]{index=1}
      "Sentimiento de afecto, inclinación y entrega a alguien o algo", // RAE :contentReference[oaicite:2]{index=2}
      "Tendencia a la unión sexual", // RAE :contentReference[oaicite:3]{index=3}
      "Blandura, suavidad (trato con amor)", // RAE :contentReference[oaicite:4]{index=4}
    ],
    type: "sustantivo",
    observations: "Muy usado",
    dateAdded: "2025-10-14",
  },
  {
    original: "andar",
    translation: "gehen / laufen",
    gender: "-",
    number: "-",
    definitions: [
      "Caminar o desplazarse",
      "Estar en funcionamiento (máquina, sistema)",
      "Ir o estar en algún estado o condición",
    ],
    type: "verbo",
    observations: "Verbo frecuente, muchas acepciones",
    dateAdded: "2025-10-14",
  },
  {
    original: "árbol",
    translation: "Baum",
    gender: "m",
    number: "sing",
    definitions: [
      "Planta leñosa de tronco elevado que se ramifica",
      "Representación gráfica de lineamientos (árbol genealógico, árbol de decisiones)",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "banco",
    translation: "Bank",
    gender: "m",
    number: "sing",
    definitions: [
      "Asiento largo para varias personas",
      "Entidad financiera",
      "Conjunto de peces agrupados (banco de peces)",
      "Institución donde se depositan valores o moneda",
    ],
    type: "sustantivo",
    observations: "Múltiples acepciones",
    dateAdded: "2025-10-14",
  },
  {
    original: "correr",
    translation: "laufen / rennen",
    gender: "-",
    number: "-",
    definitions: [
      // definiciones según RAE / DLE
      "Andar rápidamente, con tanto impulso que, entre un paso y el siguiente, los pies quedan por un momento en el aire", // RAE :contentReference[oaicite:5]{index=5}
      "Hacer algo con rapidez, darse prisa", // RAE :contentReference[oaicite:6]{index=6}
      "Dicho de un fluido: moverse progresivamente de una parte a otra (flujo)", // RAE :contentReference[oaicite:7]{index=7}
      "Ir, pasar o extenderse de una parte a otra", // RAE :contentReference[oaicite:8]{index=8}
      "Discurrir (tiempo, eventos)", // uso figurado “los años corren” :contentReference[oaicite:9]{index=9}
      "Administrar, operar (un negocio, proyecto)", // uso figurado extendido
    ],
    type: "verbo",
    observations: "Verbo muy usado, con muchos usos literales y figurados",
    dateAdded: "2025-10-14",
  },
  {
    original: "dulce",
    translation: "süß / Süßigkeit",
    gender: "-",
    number: "sing",
    definitions: [
      "Que tiene sabor a azúcar",
      "Confección azucarada (postre, golosina)",
      "Tierno, cariñoso en modo de comportarse",
      "Que es amable, grato al oído o al gusto",
    ],
    type: "adjetivo / sustantivo",
    observations: "Puede usarse como sustantivo o adjetivo",
    dateAdded: "2025-10-14",
  },
  {
    original: "estrella",
    translation: "Stern",
    gender: "f",
    number: "sing",
    definitions: [
      "Cuerpo celeste que brilla en el cielo nocturno",
      "Persona famosa o destacada en su ámbito",
      "Objeto o adorno en forma de estrella",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "fuerte",
    translation: "stark / fest",
    gender: "-",
    number: "sing",
    definitions: [
      "Que tiene gran fuerza física o moral",
      "Sólido, resistente",
      "Intenso, vigoroso (por ejemplo, viento fuerte)",
      "Persona que resiste adversidades",
    ],
    type: "adjetivo / sustantivo",
    observations: "Puede tener distintos matices en alemán y en español",
    dateAdded: "2025-10-14",
  },
  {
    original: "gente",
    translation: "Leute",
    gender: "f",
    number: "plur",
    definitions: ["Conjunto de personas", "Público", "Personas en general"],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "hogar",
    translation: "Heim",
    gender: "m",
    number: "sing",
    definitions: [
      "Lugar de residencia familiar",
      "Fuego doméstico, chimenea",
      "Ámbito íntimo y afectivo de la vivienda",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "ira",
    translation: "Zorn / Wut",
    gender: "f",
    number: "sing",
    definitions: [
      "Sentimiento de enojo intenso",
      "Cólera violenta",
      "Ira contra alguien o algo",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "jugar",
    translation: "spielen",
    gender: "-",
    number: "-",
    definitions: [
      "Participar en un juego o deporte",
      "Desempeñar un rol o función",
      "Actuar con ligereza, bromear",
    ],
    type: "verbo",
    observations: "",
    dateAdded: "2025-10-14",
  },

  // nuevas palabras añadidas
  {
    original: "camino",
    translation: "Weg / Pfad",
    gender: "m",
    number: "sing",
    definitions: [
      "Vía o sendero por donde se transita",
      "Método o procedimiento para lograr algo",
      "Curso de la vida (camino que uno toma)",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "cruzar",
    translation: "überqueren / kreuzen",
    gender: "-",
    number: "-",
    definitions: [
      "Pasar de un lado a otro (calle, río)",
      "Intersecarse (carreteras que cruzan)",
      "Cruzar brazos, cruzar mirada",
    ],
    type: "verbo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "esperanza",
    translation: "Hoffnung",
    gender: "f",
    number: "sing",
    definitions: [
      "Confianza en que ocurrirá algo deseado",
      "Expectativa de alcanzar algo que se desea",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "llama",
    translation: "Flamme / Llamada",
    gender: "f",
    number: "sing",
    definitions: [
      "Lengua de fuego",
      "Llamada telefónica o convocatoria",
      "Acción de llamar",
    ],
    type: "sustantivo / verbo",
    observations: "Homónima de “llamar” en formas verbales",
    dateAdded: "2025-10-14",
  },
  {
    original: "mirar",
    translation: "schauen / ansehen",
    gender: "-",
    number: "-",
    definitions: [
      "Dirigir la vista hacia algo",
      "Observar con cuidado",
      "Considerar, evaluar",
    ],
    type: "verbo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "noche",
    translation: "Nacht",
    gender: "f",
    number: "sing",
    definitions: [
      "Parte del día entre el ocaso y el alba",
      "Oscuridad",
      "Tiempo de dormir",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "paz",
    translation: "Frieden",
    gender: "f",
    number: "sing",
    definitions: [
      "Situación de tranquilidad sin guerra ni conflicto",
      "Quietud interior",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "querer",
    translation: "wollen / lieben",
    gender: "-",
    number: "-",
    definitions: [
      "Desear algo o tener voluntad hacia ello",
      "Amar, sentir afecto",
      "Pretender, intentar",
    ],
    type: "verbo",
    observations: "Verbo irregular",
    dateAdded: "2025-10-14",
  },
  {
    original: "sueño",
    translation: "Schlaf / Traum",
    gender: "m",
    number: "sing",
    definitions: [
      "Estado de descanso del cuerpo y la mente",
      "Conjunto de imágenes durante el dormir (soñar)",
      "Deseo o aspiración",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "tiempo",
    translation: "Zeit / Wetter",
    gender: "m",
    number: "sing",
    definitions: [
      "Duración en que ocurren los hechos",
      "Clima atmosférico (tiempo atmosférico)",
      "Momento, ocasión",
    ],
    type: "sustantivo",
    observations: "",
    dateAdded: "2025-10-14",
  },
  {
    original: "ver",
    translation: "sehen",
    gender: "-",
    number: "-",
    definitions: [
      "Percibir con los ojos",
      "Observar, examinar",
      "Conocer por decir, suponer",
    ],
    type: "verbo",
    observations: "Verbo irregular (veo, ves, ve, vemos…)",
    dateAdded: "2025-10-14",
  },
  {
    original: "vivir",
    translation: "leben",
    gender: "-",
    number: "-",
    definitions: [
      "Existir, estar con vida",
      "Habitar en un lugar",
      "Experimentar, gozar (vivir una experiencia)",
    ],
    type: "verbo",
    observations: "",
    dateAdded: "2025-10-14",
  },
];

const ITEMS_PER_PAGE = 10;

export default function DictionaryComponent() {
  const [words] = useState(sampleWords);
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [currentPage, setCurrentPage] = useState(1);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredWords = useMemo(() => {
    return words
      .filter((word) => word.original.toUpperCase().startsWith(selectedLetter))
      .sort((a, b) => a.original.localeCompare(b.original));
  }, [words, selectedLetter]);

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
  };

  const scrollRef = useRef(null);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const WordCard = ({ word, isLeft }) => (
    <div className={`p-2 ${isLeft ? "mr-2" : "ml-2"}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-row gap-2 items-center">
          <h3 className="text-2xl font-bold text-gray-900">{word.original}</h3>
          <p className="text-2xl">⇔</p>
          <p className="italic mt-1">{word.translation}</p>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <p className="text-gray-400 text-sm pb-1">
          <b>{word?.type}, </b>
          {word?.gender}., {word?.number}.
        </p>
        <span className="flex flex-row items-center align-center gap-2 text-gray-400 text-sm">
          <Calendar size="14"></Calendar> {word?.dateAdded}{" "}
        </span>
      </div>
      <hr className="mb-2"></hr>
      {word.definitions.map((definition: string, index: number) => (
        <div key={index + ""} className="">
          <sup>{index + 1}</sup> {definition}.
        </div>
      ))}

      {word.observations && (
        <p className="text-gray-600 italic text-xs mt-2">{word.observations}</p>
      )}
    </div>
  );

  const leftColumn = paginatedWords.filter((_, idx) => idx % 2 === 0);
  const rightColumn = paginatedWords.filter((_, idx) => idx % 2 === 1);

  return (
    <div className="flex flex-row-reverse overflow-hidden h-[calc(100vh-130px)]">
      {/* Sidebar alphabet */}
      <div className="border-r flex flex-col items-center divide-y overflow-y-auto h-full flex-shrink-0">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterClick(letter)}
            className={`w-8 h-8 flex items-center justify-center text-xs font-semibold transition-colors flex-shrink-0 ${
              selectedLetter === letter
                ? "bg-blue-600 text-black"
                : "text-gray-400 hover:text-black"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 py-2 min-w-0 h-full">
        {/* Scrollable Word List */}
        <div className="flex-1 overflow-y-auto pr-2" ref={scrollRef}>
          {/* Header */}
          {currentPage <= 1 && (
            <div className="mb-2 flex-shrink-0">
              <p className="text-8xl font-bold text-gray-900 mb-4">
                {selectedLetter}
              </p>
              <hr />
            </div>
          )}
          {paginatedWords.length === 0 ? (
            <div className="py-12 text-gray-500 text-center">
              No words found starting with "{selectedLetter}"
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
              {/* Left Column */}
              <div className="space-y-4">
                {leftColumn.map((word, idx) => (
                  <WordCard key={`left-${idx}`} word={word} isLeft={true} />
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {rightColumn.map((word, idx) => (
                  <WordCard key={`right-${idx}`} word={word} isLeft={false} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 flex items-center justify-center gap-4 my-2 pt-4 border-t border-gray-200 bg-white">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
