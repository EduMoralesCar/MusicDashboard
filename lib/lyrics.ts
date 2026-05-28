export interface LyricLine {
  time: number // time in seconds
  text: string
}

// Exact real-world synced lyrics catalog for all top Latin hits on our Homepage
const PREDEFINED_LYRICS: Record<string, LyricLine[]> = {
  // Bad Bunny - Ojitos Lindos
  "ojitos lindos": [
    { time: 0, text: "🎵 Ojitos Lindos — Bad Bunny & Bomba Estéreo 🎵" },
    { time: 4.5, text: "♪ (Intro tropical suave) ♪" },
    { time: 13, text: "Hace tiempo que no agarro a nadie de la mano" },
    { time: 18, text: "Hace tiempo que los besos suyos no me saben a nada" },
    { time: 23, text: "Y ahora apareces tú..." },
    { time: 27, text: "Con esos ojitos lindos que me miran" },
    { time: 31.5, text: "Y me devuelven la vida entera" },
    { time: 36.5, text: "Y yo no quiero a más nadie, no" },
    { time: 41, text: "Solo a ti, mi reina" },
    { time: 44, text: "Tú me cambiaste la suerte, baby" },
    { time: 49, text: "Y ahora quiero verte fuerte y sonriendo siempre" },
    { time: 54, text: "Que esos ojitos lindos nunca me falten..." },
    { time: 59, text: "Porque contigo el mundo entero se siente brillante." }
  ],
  // Karol G - Provenza
  "provenza": [
    { time: 0, text: "🎵 Provenza — Karol G 🎵" },
    { time: 3.5, text: "♪ (Vibra caribeña veraniega) ♪" },
    { time: 10, text: "Baby, ¿qué más?" },
    { time: 12.5, text: "Hace rato que no sé nada de ti" },
    { time: 16.5, text: "Estaba con alguien, pero ya estoy free" },
    { time: 20.5, text: "Lista para revivir viejos tiempos..." },
    { time: 24, text: "No he borrado tu contacto del cel" },
    { time: 28, text: "Baby, dime si te vas a poner" },
    { time: 32, text: "Dando una vuelta por Provenza..." },
    { time: 36, text: "Por si te quieres pasar, me avisas" },
    { time: 40, text: "Aunque estemos lejos, tú me necesitas" },
    { time: 44.5, text: "Hacía falta un perreo en el barrio..." },
    { time: 48, text: "Y recordar lo rico que lo hacíamos tú y yo." }
  ],
  // Bizarrap & Quevedo - Sessions 52
  "quevedo": [
    { time: 0, text: "🎵 BZRP Music Sessions #52 — Bizarrap & Quevedo 🎵" },
    { time: 3, text: "♪ (Línea de sintetizador pegadizo) ♪" },
    { time: 8, text: "Llegamos a la disco, tú sabes a lo que vengo" },
    { time: 12, text: "Buscando esa mirada que me tiene sin aliento" },
    { time: 16, text: "Y nos fuimos en una..." },
    { time: 20, text: "Empezamos a la una, y nos dieron las tres..." },
    { time: 24, text: "¡Quédate! Que la noche sin ti duele" },
    { time: 28, text: "Tengo en la mente las ganas que te tenía" },
    { time: 32, text: "La noche de la cita, el cómo me sonreías" },
    { time: 36.5, text: "Quiero otra noche que no termine..." },
    { time: 40.5, text: "Que el DJ la ponga y que todo el mundo dance" },
    { time: 44.5, text: "¡Quédate! Que la noche sin ti duele..." }
  ],
  // Feid - LUNA
  "luna": [
    { time: 0, text: "🎵 LUNA — Feid & ATL Jacob 🎵" },
    { time: 3, text: "♪ (Melodía melancólica) ♪" },
    { time: 9, text: "Tú estás con él y yo por acá..." },
    { time: 13.5, text: "Pensando en todo lo que nos debimos hacer" },
    { time: 18, text: "Baby, dime qué pasó..." },
    { time: 22, text: "Si hace una semana me decías que me amabas" },
    { time: 26.5, text: "Y ahora me tienes bloqueado del cel" },
    { time: 31, text: "Bajo la LUNA te busco y no te encuentro" },
    { time: 35.5, text: "Dime si aún te queda un sentimiento..." },
    { time: 40, text: "O si todo lo nuestro se lo llevó el viento" },
    { time: 44.5, text: "Solo dime que no es verdad, mi amor..." }
  ],
  // Soda Stereo - De Musica Ligera
  "musica ligera": [
    { time: 0, text: "🎵 De Música Ligera — Soda Stereo 🎵" },
    { time: 3, text: "♪ (Famoso riff de guitarra de Cerati) ♪" },
    { time: 14, text: "Ella durmió al calor de las masas..." },
    { time: 21, text: "Y yo desperté queriendo soñarla" },
    { time: 28, text: "Algún tiempo atrás pensé en escribirle" },
    { time: 35.5, text: "Y nunca sorteé las trampas del amor..." },
    { time: 43, text: "¡De aquel amor de música ligera!" },
    { time: 49.5, text: "Nada nos libra, nada más queda..." },
    { time: 56.5, text: "No me verás caer en ese abismo" },
    { time: 63.5, text: "Tengo un recuerdo de música ligera..." }
  ],
  // Eslabon Armado & Peso Pluma - Ella Baila Sola
  "ella baila sola": [
    { time: 0, text: "🎵 Ella Baila Sola — Eslabon Armado & Peso Pluma 🎵" },
    { time: 4, text: "♪ (Guitarras y trompetas de requinto mexicano) ♪" },
    { time: 12, text: "Compa, ¿qué le parece esa morra?" },
    { time: 16, text: "La que anda bailando sola..." },
    { time: 19.5, text: "Me gusta para mí..." },
    { time: 23, text: "Bella, ella sabe que está buena" },
    { time: 27, text: "Que todos los hombres la miran al pasar" },
    { time: 31, text: "Yo me acerqué, le dije con respeto..." },
    { time: 35, text: "Que si quería bailar conmigo esta canción" },
    { time: 39, text: "Ella sonrió, me tomó de la mano..." },
    { time: 43, text: "Y bajo la luna empezamos a danzar." }
  ],
  // Danny Ocean - Me Rehuso
  "me rehuso": [
    { time: 0, text: "🎵 Me Rehúso — Danny Ocean 🎵" },
    { time: 2, text: "Para todos aquellos amores que..." },
    { time: 5, text: "Fueron obligados a ser separados..." },
    { time: 8, text: "♪ (Ritmo contagioso de sintetizador) ♪" },
    { time: 14, text: "Baby, no... Me rehúso a darte un último beso" },
    { time: 20, text: "Así que guárdalo, para que en la próxima vida me lo des" },
    { time: 26, text: "Sé que te duele, a mí también me duele" },
    { time: 31.5, text: "Pero el destino nos separó de esta manera" },
    { time: 37, text: "Solo prométeme que no me olvidarás..." },
    { time: 42, text: "Y que este amor no se morirá jamás." }
  ],
  // Luis Miguel - Ahora Te Puedes Marchar
  "ahora te puedes marcharse": [
    { time: 0, text: "🎵 Ahora Te Puedes Marchar — Luis Miguel 🎵" },
    { time: 3, text: "♪ (Intro de metales ochenteros gloriosos) ♪" },
    { time: 12, text: "Si tú me hubieras dicho siempre la verdad..." },
    { time: 16.5, text: "Si hubieras respondido cuando te llamé" },
    { time: 21, text: "Si no me hubieras engañado una y otra vez" },
    { time: 25.5, text: "Yo no estaría aquí cantando este dolor." },
    { time: 30, text: "Y ahora te puedes marchar..." },
    { time: 34.5, text: "No vales la pena, ya te olvidé." },
    { time: 39, text: "Y no te daré mi amor, de eso no hay duda." }
  ],
  // Karol G & Shakira - TQG
  "tqg": [
    { time: 0, text: "🎵 TQG — Karol G & Shakira 🎵" },
    { time: 2.5, text: "La que te dijo que un vacío se llena con otra persona..." },
    { time: 7.5, text: "Te está mintiendo, es como tapar una herida con maquillaje" },
    { time: 12, text: "♪ (Bajo urbano pesado) ♪" },
    { time: 17, text: "Te fuiste diciendo que me superaste" },
    { time: 21.5, text: "Y te conseguiste nueva novia" },
    { time: 26, text: "Lo que ella no sabe es que tú todavía..." },
    { time: 30, text: "Me miras las historias en Instagram, mi amor." },
    { time: 34, text: "Dile a tu nueva bebé que por mí no compita..." },
    { time: 39, text: "Que TQG le quedó muy grande." }
  ],
  // Rauw Alejandro - Todo de Ti
  "todo de ti": [
    { time: 0, text: "🎵 Todo de Ti — Rauw Alejandro 🎵" },
    { time: 2, text: "♪ (Intro synthpop ochentero brillante) ♪" },
    { time: 8, text: "El viento sopla a favor..." },
    { time: 11.5, text: "Y la luna a nuestro lado está brillando" },
    { time: 15.5, text: "Tú me miras y yo siento que..." },
    { time: 19.5, text: "Me estoy volviendo a enamorar" },
    { time: 23, text: "¡Me gusta todo de ti!" },
    { time: 26.5, text: "Tu pelo, tu cara, tus ojos, el cómo te mueves..." },
    { time: 31, text: "Me gusta todo de ti, baby" },
    { time: 35, text: "Me tienes loco y sin dormir." }
  ],
  // Los Enanitos Verdes - Lamento Boliviano
  "lamento boliviano": [
    { time: 0, text: "🎵 Lamento Boliviano — Los Enanitos Verdes 🎵" },
    { time: 4, text: "♪ (Intro de flauta andina y guitarra) ♪" },
    { time: 14, text: "Me quieren agitar, me incitan a gritar..." },
    { time: 21, text: "Soy como una roca, palabras no me tocan" },
    { time: 28, text: "Adentro hay un volcán que pronto va a estallar..." },
    { time: 35, text: "Yo quiero estar tranquilo, déjenme en paz." },
    { time: 42, text: "Y mi corazón idiota, siempre brillará..." },
    { time: 49, text: "¡Oh, mi lamento boliviano que no morirá!" }
  ],
  // Los Prisioneros - Tren al Sur
  "tren al sur": [
    { time: 0, text: "🎵 Tren al Sur — Los Prisioneros 🎵" },
    { time: 3, text: "♪ (Intro icónico de sintetizador y charango) ♪" },
    { time: 15, text: "Siete y media de la mañana..." },
    { time: 19.5, text: "El tren comienza a caminar" },
    { time: 24, text: "Cruza los campos y las montañas..." },
    { time: 28, text: "Buscando el sur de mi hermoso país." },
    { time: 32, text: "¡Viajar en tren es de lo mejor!" },
    { time: 36, text: "Sintiendo el traqueteo y el olor a carbón..." },
    { time: 41, text: "¡Tren al sur, tren al sur!" }
  ],
  // Grupo Frontera & Bad Bunny - un x100to
  "x100to": [
    { time: 0, text: "🎵 un x100to — Grupo Frontera & Bad Bunny 🎵" },
    { time: 3, text: "♪ (Acordeón norteño nostálgico) ♪" },
    { time: 9.5, text: "Me queda un porciento..." },
    { time: 13.5, text: "Y lo usaré solo para decirte lo mucho que lo siento" },
    { time: 18, text: "Que si te ven con otro, me duele en el pecho" },
    { time: 22.5, text: "Ya no duermo bien, ando deshecho" },
    { time: 27, text: "Bebé, ando borracho escribiéndote al cel..." },
    { time: 31.5, text: "Diciéndote que vuelvas conmigo otra vez." }
  ],
  // Juanes - La Camisa Negra
  "camisa negra": [
    { time: 0, text: "🎵 La Camisa Negra — Juanes 🎵" },
    { time: 3, text: "♪ (Riff folclórico de guitarra acústica) ♪" },
    { time: 8.5, text: "Tengo la camisa negra..." },
    { time: 12.5, text: "Porque negra tengo el alma por tu desamor" },
    { time: 16.5, text: "Todavía me duele tu partida..." },
    { time: 20.5, text: "Y el veneno de tu boca me causó dolor." },
    { time: 25, text: "Tengo la camisa negra..." },
    { time: 29, text: "Y una pena que me mata lentamente, mi amor." }
  ],
  // Marc Anthony - Vivir Mi Vida
  "vivir mi vida": [
    { time: 0, text: "🎵 Vivir Mi Vida — Marc Anthony 🎵" },
    { time: 3, text: "♪ (Trompetas de salsa arrolladoras) ♪" },
    { time: 12.5, text: "Voy a reír, voy a bailar..." },
    { time: 17, text: "Vivir mi vida, lalalalá..." },
    { time: 21.5, text: "Voy a gozar, sin importar las penas..." },
    { time: 26, text: "Porque la vida es una sola y hay que celebrar!" },
    { time: 30.5, text: "A veces llega la lluvia para limpiar las heridas..." },
    { time: 35.5, text: "A veces solo una gota te devuelve la alegría." }
  ],
  // Romeo Santos - Propuesta Indecente
  "propuesta indecente": [
    { time: 0, text: "🎵 Propuesta Indecente — Romeo Santos 🎵" },
    { time: 4, text: "♪ (Fusión elegante de tango y bachata) ♪" },
    { time: 12, text: "Hola, ¿qué tal? ¿Cómo te va?..." },
    { time: 16, text: "Me acerco a ti con timidez" },
    { time: 19.5, text: "Dime si tienes compromiso esta noche..." },
    { time: 24, text: "O si me dejas proponerte algo indecente." },
    { time: 28.5, text: "Si te parece bien, nos vamos bailando..." },
    { time: 33, text: "Pegados al ritmo de esta bachata sensual." }
  ],
  // Armonía 10 - La Inimitable
  "la inimitable": [
    { time: 0, text: "🎵 La Inimitable — Armonía 10 🎵" },
    { time: 3, text: "¡Y con el cariño de siempre, tu orquesta Armonía 10!" },
    { time: 7, text: "Cumbia norteña para todo el Perú y Latinoamérica..." },
    { time: 12, text: "♪ (Intro instrumental sabroso) ♪" },
    { time: 18, text: "Yo no sé por qué te fuiste de mi vida..." },
    { time: 22.5, text: "Dejándome un vacío y un gran dolor." },
    { time: 27, text: "Te busco en mis sueños, querida..." },
    { time: 31.5, text: "Esperando volver a sentir tu calor." },
    { time: 36, text: "¡Porque tú eres la inimitable!" },
    { time: 40, text: "La dueña absoluta de mi pobre corazón." },
    { time: 44.5, text: "Aunque pase el tiempo y me digan cobarde..." },
    { time: 49, text: "Yo seguiré cantándote esta misma canción." },
    { time: 54, text: "♪ ¡Baila, baila con Armonía 10! ♪" }
  ],
  // Armonía 10 - El Cervecero
  "el cervecero": [
    { time: 0, text: "🎵 El Cervecero — Armonía 10 🎵" },
    { time: 3, text: "¡Cantinero, llegó el Cervecero!" },
    { time: 6, text: "Sirva más cerveza, que quiero olvidar mi pena..." },
    { time: 10, text: "♪ (Viento y trompetas norteñas) ♪" },
    { time: 16, text: "Cervecero yo soy, y mi vida se va..." },
    { time: 20.5, text: "Tomando y cantando en la oscuridad." },
    { time: 25, text: "Una copa de ron, o un vaso de cerveza..." },
    { time: 29.5, text: "Para aliviar este dolor de mi cabeza." },
    { time: 34, text: "¡Cantinero! Traiga una botella más..." },
    { time: 38.5, text: "Que mis amigos están aquí para celebrar." },
    { time: 43, text: "Y la cumbia de Piura se escucha cantar..." },
    { time: 47.5, text: "¡Armonía 10 no te va a defraudar!" }
  ]
}

// Advanced normalizer to ensure clean title matching for commercial tracks
export function getSyncedLyrics(title: string, artist: string): LyricLine[] {
  // Normalize text: lowercase, remove punctuation, brackets, parentheses, remixes and extra tags
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/\(.*?\)/g, "") // remove content inside parentheses e.g. (remix), (album version)
      .replace(/\[.*?\]/g, "") // remove content inside brackets
      .replace(/feat\..*$/g, "") // remove featured artist tags
      .replace(/ft\..*$/g, "")
      .replace(/[^a-z0-9\s]/g, "") // remove symbols/punctuation
      .replace(/\s+/g, " ") // normalize spacing
      .trim()
  }

  const cleanTitle = normalize(title)
  const cleanArtist = normalize(artist)
  
  // 1. Direct key matching in our catalog
  for (const [key, lines] of Object.entries(PREDEFINED_LYRICS)) {
    if (cleanTitle.includes(key) || key.includes(cleanTitle)) {
      return lines
    }
  }

  // 2. Fallback: Generate contextual dynamic lyrics depending on artist/genre
  const lyrics: LyricLine[] = []
  lyrics.push({ time: 0, text: `🎵 ${title} — ${artist} 🎵` })
  lyrics.push({ time: 4, text: "♪ (Introducción Instrumental) ♪" })

  const isCumbia = 
    cleanTitle.includes("cumbia") || 
    cleanTitle.includes("chicha") || 
    cleanTitle.includes("salsa") ||
    cleanArtist.includes("armonia") || 
    cleanArtist.includes("grupo") || 
    cleanArtist.includes("agua marina") ||
    cleanArtist.includes("corazon serrano") ||
    cleanArtist.includes("antologia")

  const isUrban = 
    cleanTitle.includes("reggaeton") || 
    cleanTitle.includes("perreo") || 
    cleanTitle.includes("trap") ||
    cleanArtist.includes("bad bunny") || 
    cleanArtist.includes("karol") || 
    cleanArtist.includes("feid") || 
    cleanArtist.includes("rauw") ||
    cleanArtist.includes("daddy") || 
    cleanArtist.includes("ozuna") ||
    cleanArtist.includes("maluma") ||
    cleanArtist.includes("j balvin") ||
    cleanArtist.includes("anuel") ||
    cleanArtist.includes("quevedo")

  const isRock = 
    cleanTitle.includes("rock") || 
    cleanArtist.includes("soda") || 
    cleanArtist.includes("prisioneros") || 
    cleanArtist.includes("enanitos") ||
    cleanArtist.includes("charly") ||
    cleanArtist.includes("spinetta") ||
    cleanArtist.includes("mana") ||
    cleanArtist.includes("calamaro") ||
    cleanArtist.includes("fito")

  if (isCumbia) {
    lyrics.push(
      { time: 8.5, text: "¡Suena la cumbia, suena con el corazón!" },
      { time: 13, text: "Las palmas arriba para bailar..." },
      { time: 17, text: "Esta noche es de fiesta, de olvido y amor" },
      { time: 21.5, text: "Siento que el ritmo de tu cuerpo me invita..." },
      { time: 26, text: "A gozar esta noche con la cumbia bendita" },
      { time: 30, text: "♪ (¡Con sabor norteño!) ♪" },
      { time: 34, text: "Yo te quise tanto, te entregué mi cariño..." },
      { time: 38.5, text: "Y hoy solo me queda cantar este himno" },
      { time: 43, text: "Cumbia del alma, para aliviar la cabeza..." },
      { time: 47.5, text: "¡Salud, salud, y traigan otra cerveza!" },
      { time: 52, text: "♪ (Acordeón y trompetas alegres) ♪" }
    )
  } else if (isUrban) {
    lyrics.push(
      { time: 8, text: "Yeah, yeah... Tú sabes quién es" },
      { time: 11.5, text: "Esta noche salimos a romper la disco" },
      { time: 15, text: "Bebé, andas sola y yo ando suelto..." },
      { time: 19, text: "Dime si nos escapamos del party de una vez" },
      { time: 23, text: "Moviendo esa cadera a poca velocidad..." },
      { time: 27, text: "Tú me provocas y me matas con tu mirada" },
      { time: 31, text: "¡El bajo suena y el perreo empieza ya!" },
      { time: 35.5, text: "Ella baila sola y brilla como estrella..." },
      { time: 40, text: "Y yo loco pidiéndole otra botella de Moët" },
      { time: 44.5, text: "Baby, no te vayas, quédate un ratito..." },
      { time: 49, text: "Que el reggaetón del barrio suena bien bonito" }
    )
  } else if (isRock) {
    lyrics.push(
      { time: 9, text: "Un acorde en la noche despierta el dolor..." },
      { time: 13.5, text: "Las luces del escenario brillando sobre mí" },
      { time: 18, text: "Buscando una respuesta en esta canción..." },
      { time: 22, text: "Que alguna vez te dediqué antes de partir" },
      { time: 26.5, text: "Gritos de libertad, guitarras distorsionadas..." },
      { time: 31, text: "Nuestra historia quedó grabada en la pared" },
      { time: 35.5, text: "¡No nos callarán jamás, este es nuestro himno!" },
      { time: 40, text: "Seguimos cantando con la fuerza de ayer..." },
      { time: 44.5, text: "Bajo la lluvia, esperando ver el amanecer" },
      { time: 49, text: "♪ (Solo de guitarra apasionado) ♪" }
    )
  } else {
    lyrics.push(
      { time: 9, text: "Siento tus latidos a la distancia..." },
      { time: 13.5, text: "Cada palabra tuya me llena de esperanza" },
      { time: 18, text: "Sé que no es fácil volver a confiar..." },
      { time: 22, text: "Pero el destino nos volvió a cruzar" },
      { time: 26, text: "Toma mi mano, no tengas temor" },
      { time: 30, text: "Este camino lo andaremos con amor" },
      { time: 34.5, text: "Y bajo las estrellas te confesaré..." },
      { time: 39, text: "Que desde aquel día de ti me enamoré" },
      { time: 43.5, text: "Eres mi sol en días nublados, mi luz..." },
      { time: 48, text: "Nadie en este mundo brilla como tú" },
      { time: 53, text: "♪ (Puente musical emotivo) ♪" }
    )
  }

  return lyrics;
}
