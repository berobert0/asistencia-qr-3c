const API = "TU_URL";

let chart;

function cargar(){

fetch(API + "?tipo=panel")
.then(r => r.json())
.then(data => {

let a = 0;
let t = 0;
let f = 0;

let html = "";

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

tabla.innerHTML = html;

asis.innerHTML = a;
tard.innerHTML = t;
falt.innerHTML = f;

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

cargar();

setInterval(cargar,5000);
