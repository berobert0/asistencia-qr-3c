const API="https://script.google.com/macros/s/AKfycbwn8J_sZ0MRDzKrDefOKUCJ9sTzOJ0h2MGDYAzu-DpjN4WXz0bSlA7Jm-vSjR0bJm7L/exec";

let chart;

function login(){

fetch(API+
"?tipo=login"+
"&user="+user.value+
"&pass="+pass.value)

.then(r=>r.json())
.then(d=>{

 if(d.ok){

   document.getElementById("login")
   .style.display="none";

   document.getElementById("panel")
   .style.display="block";

   cargar();

 }else{
   alert("Credenciales incorrectas");
 }

});

}

function cargar(){

fetch(API+"?tipo=panel")
.then(r=>r.json())
.then(data=>{

let a=0,t=0,f=0;
let html="";

data.reverse().forEach(x=>{

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

tabla.innerHTML=html;

asis.innerHTML=a;
tard.innerHTML=t;
falt.innerHTML=f;

if(chart) chart.destroy();

chart = new Chart(
document.getElementById("grafico"),
{
type:"bar",
data:{
labels:["Asistencia","Tardanza","Falta"],
datasets:[{
data:[a,t,f]
}]
}
});

});

}

function exportar(){

let tablaHTML =
document.querySelector("table")
.outerHTML;

let blob = new Blob(
[tablaHTML],
{type:"application/vnd.ms-excel"}
);

let a = document.createElement("a");

a.href = URL.createObjectURL(blob);

a.download="reporte.xls";

a.click();

}

setInterval(()=>{
 if(panel.style.display=="block"){
   cargar();
 }
},5000);
