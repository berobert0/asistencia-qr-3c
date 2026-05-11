const API =
"https://script.google.com/macros/s/AKfycbwb_k8JvvmzldaPk-D-8uHPg7craueCyK-pcM61Vy2s46slSvA3LzWr8yh-vldJK0gq/exec";

let bloqueado = false;

const qr =
new Html5Qrcode("reader");


/****************************************
 SONIDO
****************************************/
function beep(){

 const audio = new Audio(
 "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
 );

 audio.play();

}


/****************************************
 ESCANER
****************************************/
qr.start(

 { facingMode:"environment" },

 {
   fps:10,
   qrbox:220
 },

 (texto) => {

   if(bloqueado) return;

   bloqueado = true;

   beep();

   if(navigator.vibrate){

     navigator.vibrate(200);

   }

   fetch(
    API +
    "?codigo=" +
    encodeURIComponent(texto)
   )

   .then(r => r.json())

   .then(d => {

      document.getElementById("nombre")
      .innerHTML = d.nombre || "";

      document.getElementById("estado")
      .innerHTML = d.estado || "";

      document.getElementById("mensaje")
      .innerHTML = d.mensaje || "";

      /********************************
       COLORES
      ********************************/
      const estado =
      document.getElementById("estado");

      if(d.estado=="ASISTENCIA"){

        estado.style.color="#22c55e";

      }else if(d.estado=="TARDANZA"){

        estado.style.color="#eab308";

      }else if(d.estado=="FALTA"){

        estado.style.color="#ef4444";

      }else if(d.estado=="DUPLICADO"){

        estado.style.color="#f97316";

      }

      /********************************
       FOTO
      ********************************/
      let foto =
      document.getElementById("foto");

      if(d.foto){

        foto.src = d.foto;

        foto.style.display = "block";

      }else{

        foto.style.display = "none";

      }

      /********************************
       DESBLOQUEAR
      ********************************/
      setTimeout(() => {

        bloqueado = false;

      },3000);

   })

   .catch(err => {

      console.log(err);

      bloqueado = false;

   });

 }

);
