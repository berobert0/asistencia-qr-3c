const API = "https://script.google.com/macros/s/AKfycbzhEGXTtJbWpCvrUgF2beJ4dtlDoFw0WetOVeHF3S7nuPLoV6AGiqMuezL17rZCtsMc/exec";

let bloqueado = false;

const qr = new Html5Qrcode("reader");

qr.start(
 { facingMode: "environment" },
 { fps: 10, qrbox: 220 },

 (texto) => {

   if (bloqueado) return;

   bloqueado = true;

   fetch(API + "?codigo=" + encodeURIComponent(texto))
   .then(r => r.json())
   .then(d => {

      document.getElementById("nombre").innerHTML = d.nombre;
      document.getElementById("estado").innerHTML = d.estado;
      document.getElementById("mensaje").innerHTML = d.mensaje;

      let foto = document.getElementById("foto");

      if (d.foto) {
        foto.src = d.foto;
        foto.style.display = "block";
      } else {
        foto.style.display = "none";
      }

      setTimeout(() => {
        bloqueado = false;
      }, 3000);

   });

 }
);
