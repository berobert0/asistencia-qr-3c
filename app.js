const API =
"https://script.google.com/macros/s/AKfycbz5RfBkeCIPa5zcayzbtpe3YYuzAmoCAzep-7q1VH_MO4AMt1OUz3aQ5sjeKkDaq_uf/exec";

let bloqueado=false;
let sonido;

document.body.addEventListener("click",()=>{

  if(!sonido){

    sonido = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
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

  if(sonido){

    sonido.currentTime=0;

    sonido.play().catch(()=>{});

  }

  if(navigator.vibrate){

    navigator.vibrate(200);

  }

  fetch(
    API+
    "?codigo="+
    encodeURIComponent(texto)
  )

  .then(r=>r.json())

  .then(d=>{

    nombre.innerHTML =
    d.nombre || "";

    mensaje.innerHTML =
    d.mensaje || "";

    estado.innerHTML =
    d.estado || "";

    if(d.estado==="ASISTENCIA"){
      estado.style.color="#22c55e";
    }

    else if(d.estado==="TARDANZA"){
      estado.style.color="#facc15";
    }

    else if(d.estado==="FALTA"){
      estado.style.color="#ef4444";
    }

    else if(d.estado==="DUPLICADO"){
      estado.style.color="#f97316";
    }

    if(d.foto){

      foto.src=d.foto;

      foto.style.display="block";

    }else{

      foto.style.display="none";

    }

    setTimeout(()=>{

      bloqueado=false;

    },3000);

  })

  .catch(err=>{

    console.log(err);

    mensaje.innerHTML =
    "Error conexión";

    bloqueado=false;

  });

});
