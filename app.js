const API =
"https://script.google.com/macros/s/AKfycbxivZO64l9vCuvubiFDj01Y4fIgIkRzbsKRxyXxp8Lo-qy7V_pXOIiDvx2Hi7x9QHAQ/exec";

let bloqueado=false;

let sonido;

document.body.addEventListener("click", ()=>{

  if(!sonido){

    sonido = new Audio(

      "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"

    );

  }

});

const qr =
new Html5Qrcode("reader");

qr.start(

{ facingMode:"environment" },

{ fps:10, qrbox:220 },

(texto)=>{

  if(bloqueado) return;

  bloqueado=true;

  // SONIDO
  if(sonido){

    sonido.currentTime=0;

    sonido.play().catch(()=>{});

  }

  // VIBRACION
  if(navigator.vibrate){

    navigator.vibrate(200);

  }

  fetch(

    API +

    "?codigo=" +

    encodeURIComponent(texto)

  )

  .then(r=>r.json())

  .then(d=>{

    document.getElementById(
      "nombre"
    ).innerHTML =

    d.nombre || "";

    document.getElementById(
      "mensaje"
    ).innerHTML =

    d.mensaje || "";

    let estado =
    document.getElementById(
      "estado"
    );

    estado.innerHTML =
    d.estado || "";

    switch(d.estado){

      case "ASISTENCIA":

        estado.style.color =
        "#22c55e";

      break;

      case "TARDANZA":

        estado.style.color =
        "#facc15";

      break;

      case "FALTA":

        estado.style.color =
        "#ef4444";

      break;

      case "DUPLICADO":

        estado.style.color =
        "#f97316";

      break;

      default:

        estado.style.color =
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

      bloqueado=false;

    },3000);

  })

  .catch(err=>{

    console.error(err);

    bloqueado=false;

  });

}
);
