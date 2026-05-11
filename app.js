const API =
"https://script.google.com/macros/s/AKfycbyPbslr15y2s-jxxh5xUJ1PPw2ruyMp0pwI8sT8XXH8-dCTIn6_elkWc8Mla1tS7Lg/exec";

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

  let voz =
  new SpeechSynthesisUtterance(texto);

  voz.lang = "es-ES";

  speechSynthesis.speak(voz);

}


// ======================================
// ESCANER QR
// ======================================

const qr =
new Html5Qrcode("reader");

qr.start(

  { facingMode:"environment" },

  {
    fps:10,
    qrbox:220
  },

(texto)=>{

  if(bloqueado) return;

  bloqueado = true;

  // VIBRACION

  if(navigator.vibrate){

    navigator.vibrate(200);

  }

  // API

  fetch(
    API +
    "?codigo=" +
    encodeURIComponent(texto)
  )

  .then(r=>{

    if(!r.ok){

      throw new Error(
        "Error servidor"
      );

    }

    return r.json();

  })

  .then(d=>{

    const nombreHTML =
    document.getElementById("nombre");

    const mensajeHTML =
    document.getElementById("mensaje");

    const estadoHTML =
    document.getElementById("estado");

    const fotoHTML =
    document.getElementById("foto");

    // DATOS

    nombreHTML.innerHTML =
    d.nombre || "SIN NOMBRE";

    mensajeHTML.innerHTML =
    d.mensaje || "";

    // ESTADO

    let estadoHora =
    obtenerEstadoPorHora();

    let estadoFinal =
    d.estado === "DUPLICADO"
    ? "DUPLICADO"
    : estadoHora;

    // SWITCH

    switch(estadoFinal){

      case "ASISTENCIA":

        estadoHTML.innerHTML =
        "🟢 ASISTENCIA";

        estadoHTML.style.color =
        "#22c55e";

        document.body.style.background =
        "#052e16";

        sonidoAsistencia?.play();

        hablar(
          "Bienvenido " +
          d.nombre
        );

      break;


      case "TARDANZA":

        estadoHTML.innerHTML =
        "🟡 TARDANZA";

        estadoHTML.style.color =
        "#facc15";

        document.body.style.background =
        "#3f2f00";

        sonidoTardanza?.play();

      break;


      case "FALTA":

        estadoHTML.innerHTML =
        "🔴 FALTA";

        estadoHTML.style.color =
        "#ef4444";

        document.body.style.background =
        "#450a0a";

        sonidoFalta?.play();

      break;


      case "DUPLICADO":

        estadoHTML.innerHTML =
        "⚠️ DUPLICADO";

        estadoHTML.style.color =
        "#f97316";

        document.body.style.background =
        "#431407";

        sonidoDuplicado?.play();

      break;


      default:

        estadoHTML.innerHTML =
        "⏰ FUERA DE HORARIO";

        estadoHTML.style.color =
        "#9ca3af";

    }

    // FOTO

    if(d.foto){

      let urlFoto =
      d.foto;

      if(
        urlFoto.includes(
          "drive.google.com"
        )
      ){

        let match =
        urlFoto.match(
          /\/d\/(.*?)\//
        );

        if(match && match[1]){

          urlFoto =
          "https://drive.google.com/uc?export=view&id=" +
          match[1];

        }

      }

      fotoHTML.src =
      urlFoto;

      fotoHTML.style.display =
      "block";

    }else{

      fotoHTML.style.display =
      "none";

    }

    // RESET

    setTimeout(()=>{

      document.body.style.background =
      "#111827";

      bloqueado = false;

    },3000);

  })

  .catch(err=>{

    console.log(err);

    document.getElementById(
      "mensaje"
    ).innerHTML =
    "❌ ERROR";

    bloqueado = false;

  });

}

);
