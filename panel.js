const API =
"https://script.google.com/macros/s/AKfycbwb_k8JvvmzldaPk-D-8uHPg7craueCyK-pcM61Vy2s46slSvA3LzWr8yh-vldJK0gq/exec";

let chart;


/****************************************
 LOGIN
****************************************/
function login(){

  const usuario =
  document.getElementById("user").value;

  const clave =
  document.getElementById("pass").value;

  fetch(
    API +
    "?tipo=login" +
    "&user=" + encodeURIComponent(usuario) +
    "&pass=" + encodeURIComponent(clave)
  )

  .then(r => r.json())

  .then(d => {

    if(d.ok){

      document.getElementById("login")
      .style.display = "none";

      document.getElementById("panel")
      .style.display = "block";

      cargar();

    }else{

      alert("Credenciales incorrectas");

    }

  })

  .catch(err => {

    console.log(err);

    alert("Error conexión");

  });

}


/****************************************
 CARGAR PANEL
****************************************/
function cargar(){

fetch(API + "?tipo=panel")

.then(r => r.json())

.then(data => {

let a=0;
let t=0;
let f=0;

let html="";

data.reverse().forEach(x => {

 if(x.estado=="ASISTENCIA") a++;
 if(x.estado=="TARDANZA") t++;
 if(x.estado=="FALTA") f++;

 html += `
 <tr>
   <td>${x.nombre}</td>
   <td>${x.hora}</td>
   <td>${x.estado}</td>
 </tr>
 `;

});

document.getElementById("tabla").innerHTML = html;

document.getElementById("asis").innerHTML = a;
document.getElementById("tard").innerHTML = t;
document.getElementById("falt").innerHTML = f;


/****************************************
 GRAFICO
****************************************/
if(chart){

 chart.destroy();

}

chart = new Chart(

document.getElementById("grafico"),

{
 type:"bar",

 data:{

  labels:[
   "Asistencia",
   "Tardanza",
   "Falta"
  ],

  datasets:[{

   data:[a,t,f]

  }]

 }

});

})

.catch(err => {

 console.log(err);

});

}


/****************************************
 EXPORTAR EXCEL
****************************************/
function exportar(){

let tablaHTML =
document.querySelector("table").outerHTML;

let blob = new Blob(

 [tablaHTML],

 {type:"application/vnd.ms-excel"}

);

let a = document.createElement("a");

a.href = URL.createObjectURL(blob);

a.download = "reporte.xls";

a.click();

}


/****************************************
 ACTUALIZAR AUTOMÁTICO
****************************************/
setInterval(() => {

 if(
  document.getElementById("panel")
  .style.display == "block"
 ){

   cargar();

 }

},5000);
