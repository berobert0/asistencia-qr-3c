const API="https://script.google.com/macros/s/AKfycbz5RfBkeCIPa5zcayzbtpe3YYuzAmoCAzep-7q1VH_MO4AMt1OUz3aQ5sjeKkDaq_uf/exec";

let bloqueado = false;

// ======================================
// SONIDOS
// ======================================

let sonidoAsistencia;
let sonidoTardanza;
let sonidoFalta;
let sonidoDuplicado;

// ======================================
// ACTIVAR SONIDOS
// ======================================

document.body.addEventListener("click", ()=>{

  if(!sonidoAsistencia){

    sonidoAsistencia = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
    );

    sonidoTardanza = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );

    sonidoFalta = new Audio(
      "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
    );

    sonidoDuplicado = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg"
    );

    console.log("🔊 Sonidos cargados");

  }

},{ once:true });


// ======================================
// VALIDAR HORARIO
// ======================================

function obtenerEstadoPorHora(){

  let ahora = new Date();

  let horas = ahora.getHours();
  let minutos = ahora.getMinutes();

  let horaActual = horas * 60 + minutos;

  const inicio     = 7 * 60 + 40;
  const asistencia = 7 * 60 + 59;
  const tardanza   = 8 * 60 + 30;
  const salida     = 12 * 60 + 40;

  if(horaActual < inicio){

    return "FUERA DE HORARIO";

  }
  else if(horaActual <= asistencia){

    return "ASISTENCIA";

  }
  else if(horaActual <= tardanza){

    return "TARDANZA";

  }
  else if(horaActual <= salida){

    return "FALTA";

  }
  else{

    return "FUERA DE HORARIO";

  }

}


// ======================================
// VOZ
// ======================================

function hablar(texto){

  if(!window.speechSynthesis) return;

  let voz = new SpeechSynthesisUtterance(texto);

  voz.lang = "es-ES";
  voz.rate = 1;

  speechSynthesis.speak(voz);

}


// ======================================
// ESCANER QR
// ======================================

const qr = new Html5Qrcode("reader");

qr.start(

  { facingMode:"environment" },

  {
    fps:10,
    qrbox:220
  },

(texto)=>{

  if(bloqueado) return;

  bloqueado = true;

  // 📳 vibración

  if(navigator.vibrate){

    navigator.vibrate(200);

  }

  // ======================================
  // CONSULTA API
  // ======================================

  fetch(API + "?codigo=" + encodeURIComponent(texto))

  .then(r=>{

    if(!r.ok){

      throw new Error("Error servidor");

    }

    return r.json();

  })

  .then(d=>{

    // ======================================
    // HTML
    // ======================================

    const nombreHTML  = document.getElementById("nombre");
    const mensajeHTML = document.getElementById("mensaje");
    const estadoHTML  = document.getElementById("estado");
    const fotoHTML    = document.getElementById("foto");

    nombreHTML.innerHTML =
    d.nombre || "Sin nombre";

    mensajeHTML.innerHTML =
    d.mensaje || "";

    // ======================================
    // ESTADO
    // ======================================

    let estadoHora =
    obtenerEstadoPorHora();

    let estadoFinal =
    d.estado === "DUPLICADO"
    ? "DUPLICADO"
    : estadoHora;

    // ======================================
    // SONIDOS + COLORES
    // ======================================

    switch(estadoFinal){

      case "ASISTENCIA":

        estadoHTML.innerHTML =
        "🟢 ASISTENCIA";

        estadoHTML.style.color =
        "#22c55e";

        document.body.style.background =
        "#052e16";

        sonidoAsistencia?.play();

        hablar("Bienvenido " + d.nombre);

      break;


      case "TARDANZA":

        estadoHTML.innerHTML =
        "🟡 TARDANZA";

        estadoHTML.style.color =
        "#facc15";

        document.body.style.background =
        "#3f2f00";

        sonidoTardanza?.play();

        hablar("Tardanza");

      break;


      case "FALTA":

        estadoHTML.innerHTML =
        "🔴 FALTA";

        estadoHTML.style.color =
        "#ef4444";

        document.body.style.background =
        "#450a0a";

        sonidoFalta?.play();

        hablar("Falta");

      break;


      case "DUPLICADO":

        estadoHTML.innerHTML =
        "⚠️ DUPLICADO";

        estadoHTML.style.color =
        "#f97316";

        document.body.style.background =
        "#431407";

        sonidoDuplicado?.play();

        hablar("Registro duplicado");

      break;


      default:

        estadoHTML.innerHTML =
        "⏰ FUERA DE HORARIO";

        estadoHTML.style.color =
        "#6b7280";

        document.body.style.background =
        "#111827";

    }

    // ======================================
    // FOTO
    // ======================================

    if(d.foto && d.foto.startsWith("http")){

      fotoHTML.src = d.foto;

      fotoHTML.style.display =
      "block";

    }else{

      fotoHTML.style.display =
      "none";

    }

    // ======================================
    // RESETEAR COLOR
    // ======================================

    setTimeout(()=>{

      document.body.style.background =
      "#111827";

      bloqueado = false;

    },3000);

  })

  .catch(err=>{

    console.error(err);

    document.getElementById("mensaje").innerHTML =
    "❌ Error de conexión";

    bloqueado = false;

  });

}

);
