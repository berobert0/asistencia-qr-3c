// ======================================
// API GOOGLE APPS SCRIPT
// ======================================

const API =
"https://script.google.com/macros/s/AKfycbz5RfBkeCIPa5zcayzbtpe3YYuzAmoCAzep-7q1VH_MO4AMt1OUz3aQ5sjeKkDaq_uf/exec";


// ======================================
// VARIABLES
// ======================================

let bloqueado = false;
let sonido;


// ======================================
// ACTIVAR SONIDO EN MOVIL
// ======================================

document.body.addEventListener("click", () => {

  if (!sonido) {

    sonido = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
    );

  }

});


// ======================================
// VALIDAR HORARIO
// ======================================

function obtenerEstadoPorHora() {

  let ahora = new Date();

  let horas = ahora.getHours();
  let minutos = ahora.getMinutes();

  let horaActual = horas * 60 + minutos;

  // HORARIOS
  const inicio     = 7 * 60 + 40; // 7:40
  const asistencia = 7 * 60 + 59; // 7:59
  const tardanza   = 8 * 60 + 30; // 8:30
  const salida     = 12 * 60 + 40; // 12:40

  if (horaActual < inicio) {

    return "FUERA DE HORARIO";

  } else if (horaActual <= asistencia) {

    return "ASISTENCIA";

  } else if (horaActual <= tardanza) {

    return "TARDANZA";

  } else if (horaActual <= salida) {

    return "FALTA";

  } else {

    return "FUERA DE HORARIO";

  }

}


// ======================================
// QR SCANNER
// ======================================

const qr = new Html5Qrcode("reader");

qr.start(

  { facingMode: "environment" },

  {
    fps: 10,
    qrbox: 220
  },

  (texto) => {

    // EVITAR MULTIPLE LECTURA
    if (bloqueado) return;

    bloqueado = true;

    // ======================================
    // SONIDO
    // ======================================

    if (sonido) {

      sonido.currentTime = 0;

      sonido.play().catch(() => {});

    }

    // ======================================
    // VIBRACION MOVIL
    // ======================================

    if (navigator.vibrate) {

      navigator.vibrate(200);

    }

    // ======================================
    // CONSULTA API
    // ======================================

    fetch(
      API + "?codigo=" + encodeURIComponent(texto)
    )

    .then((r) => {

      if (!r.ok) {

        throw new Error("Error servidor");

      }

      return r.json();

    })

    .then((d) => {

      // ======================================
      // ELEMENTOS HTML
      // ======================================

      const nombre  = document.getElementById("nombre");
      const mensaje = document.getElementById("mensaje");
      const estado  = document.getElementById("estado");
      const foto    = document.getElementById("foto");

      // ======================================
      // DATOS
      // ======================================

      nombre.innerHTML =
      d.nombre || "SIN NOMBRE";

      mensaje.innerHTML =
      d.mensaje || "";

      // ======================================
      // ESTADO POR HORA
      // ======================================

      let estadoHora = obtenerEstadoPorHora();

      // SI API DICE DUPLICADO
      // RESPETAR ESE ESTADO

      let estadoFinal =
      d.estado === "DUPLICADO"
      ? "DUPLICADO"
      : estadoHora;

      // ======================================
      // COLORES Y MENSAJES
      // ======================================

      switch (estadoFinal) {

        case "ASISTENCIA":

          estado.innerHTML =
          "🟢 ASISTENCIA";

          estado.style.color =
          "#22c55e";

        break;


        case "TARDANZA":

          estado.innerHTML =
          "🟡 TARDANZA";

          estado.style.color =
          "#facc15";

        break;


        case "FALTA":

          estado.innerHTML =
          "🔴 FALTA";

          estado.style.color =
          "#ef4444";

        break;


        case "DUPLICADO":

          estado.innerHTML =
          "⚠️ DUPLICADO";

          estado.style.color =
          "#f97316";

        break;


        default:

          estado.innerHTML =
          "⏰ FUERA DE HORARIO";

          estado.style.color =
          "#6b7280";

      }

      // ======================================
      // FOTO
      // ======================================

      if (
        d.foto &&
        d.foto.startsWith("http")
      ) {

        foto.src = d.foto;

        foto.style.display = "block";

      } else {

        foto.style.display = "none";

      }

      // ======================================
      // DESBLOQUEAR
      // ======================================

      setTimeout(() => {

        bloqueado = false;

      }, 3000);

    })

    .catch((err) => {

      console.error(err);

      document.getElementById("mensaje").innerHTML =
      "❌ Error de conexión";

      document.getElementById("estado").innerHTML =
      "";

      bloqueado = false;

    });

  }

);
