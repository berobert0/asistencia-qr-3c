const API="https://script.google.com/macros/s/AKfycbyPbslr15y2s-jxxh5xUJ1PPw2ruyMp0pwI8sT8XXH8-dCTIn6_elkWc8Mla1tS7Lg/exec";

let bloqueado=false;

let sonido;

// SONIDO
document.body.addEventListener("click", ()=>{

  if(!sonido){

    sonido = new Audio(

      "https://drive.google.com/uc?export=download&id=1ech4VhO76WcQtg_yJH8zU-PIUCbQSqiv"

    );

  }

});

// HORARIO
function obtenerEstadoPorHora(){

  let ahora = new Date();

  let horas = ahora.getHours();
  let minutos = ahora.getMinutes();

  let horaActual =
  horas * 60 + minutos;

  const inicio = 460;
  const asistencia = 480;
  const tardanza = 540;
  const salida = 760;

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

// ESCANER
const qr =
new Html5Qrcode("reader");

qr.start(

{ facingMode:"environment" },

{ fps:10, qrbox:220 },

(texto)=>{

  if(bloqueado) return;

  bloqueado = true;

  // SONIDO
  if(sonido){

    sonido.currentTime = 0;

    sonido.play().catch(()=>{});

  }

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

    if(!r.ok)
    throw new Error("Servidor");

    return r.json();

  })

  .then(d=>{

    document.getElementById(
      "nombre"
    ).innerHTML =

    d.nombre || "SIN NOMBRE";

    document.getElementById(
      "mensaje"
    ).innerHTML =

    d.mensaje || "";

    let estadoHTML =
    document.getElementById(
      "estado"
    );

    let estadoFinal =
    d.estado;

    switch(estadoFinal){

      case "ASISTENCIA":

        estadoHTML.innerHTML =
        "🟢 ASISTENCIA";

        estadoHTML.style.color =
        "#22c55e";

      break;

      case "TARDANZA":

        estadoHTML.innerHTML =
        "🟡 TARDANZA";

        estadoHTML.style.color =
        "#facc15";

      break;

      case "FALTA":

        estadoHTML.innerHTML =
        "🔴 FALTA";

        estadoHTML.style.color =
        "#ef4444";

      break;

      case "DUPLICADO":

        estadoHTML.innerHTML =
        "⚠️ DUPLICADO";

        estadoHTML.style.color =
        "#f97316";

      break;

      default:

        estadoHTML.innerHTML =
        "⏰ " + estadoFinal;

        estadoHTML.style.color =
        "#9ca3af";

    }

    // FOTO
    let foto =
    document.getElementById(
      "foto"
    );

    if(

      d.foto &&

      d.foto.startsWith("http")

    ){

      foto.src = d.foto;

      foto.style.display =
      "block";

    }else{

      foto.style.display =
      "none";

    }

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
