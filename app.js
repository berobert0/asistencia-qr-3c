const API =
"https://script.google.com/macros/s/AKfycbxivZO64l9vCuvubiFDj01Y4fIgIkRzbsKRxyXxp8Lo-qy7V_pXOIiDvx2Hi7x9QHAQ/exec";

// ======================================
// VARIABLES
// ======================================

let bloqueado = false;

// ======================================
// SONIDO QR
// ======================================

const sonidoQR = new Audio(

  "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"

);

// PRECARGAR
sonidoQR.load();

sonidoQR.volume = 1;

// ======================================
// REPRODUCIR SONIDO
// ======================================

function reproducirSonido(){

  sonidoQR.currentTime = 0;

  sonidoQR.play()

  .then(()=>{

    console.log("🔊 SONIDO OK");

  })

  .catch(error=>{

    console.log(

      "ERROR AUDIO",

      error

    );

  });

}

// ======================================
// QR
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

  // ======================================
  // BLOQUEAR
  // ======================================

  if(bloqueado) return;

  bloqueado = true;

  // ======================================
  // SONIDO
  // ======================================

  reproducirSonido();

  // ======================================
  // VIBRACIÓN
  // ======================================

  if(navigator.vibrate){

    navigator.vibrate(200);

  }

  // ======================================
  // API
  // ======================================

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

    // ======================================
    // HTML
    // ======================================

    const nombreHTML =
    document.getElementById("nombre");

    const mensajeHTML =
    document.getElementById("mensaje");

    const estadoHTML =
    document.getElementById("estado");

    const fotoHTML =
    document.getElementById("foto");

    // ======================================
    // DATOS
    // ======================================

    nombreHTML.innerHTML =

    d.nombre || "SIN NOMBRE";

    mensajeHTML.innerHTML =

    d.mensaje || "";

    estadoHTML.innerHTML =

    d.estado || "";

    // ======================================
    // COLORES
    // ======================================

    switch(d.estado){

      case "ASISTENCIA":

        estadoHTML.style.color =
        "#22c55e";

      break;

      case "TARDANZA":

        estadoHTML.style.color =
        "#facc15";

      break;

      case "FALTA":

        estadoHTML.style.color =
        "#ef4444";

      break;

      case "DUPLICADO":

        estadoHTML.style.color =
        "#f97316";

      break;

      default:

        estadoHTML.style.color =
        "#9ca3af";

    }

    // ======================================
    // FOTO
    // ======================================

    if(

      d.foto &&
      d.foto.startsWith("http")

    ){

      fotoHTML.src = d.foto;

      fotoHTML.style.display =
      "block";

    }

    else{

      fotoHTML.style.display =
      "none";

    }

    // ======================================
    // DESBLOQUEAR
    // ======================================

    setTimeout(()=>{

      bloqueado = false;

    },3000);

  })

  .catch(err=>{

    console.error(err);

    document.getElementById(

      "mensaje"

    ).innerHTML =

    "❌ Error conexión";

    bloqueado = false;

  });

}

);
