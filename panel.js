const API="https://script.google.com/macros/s/AKfycbyPbslr15y2s-jxxh5xUJ1PPw2ruyMp0pwI8sT8XXH8-dCTIn6_elkWc8Mla1tS7Lg/exec";

let chartBar;
let chartPie;

function login(){

  fetch(

    API+

    "?tipo=login"+

    "&user="+
    encodeURIComponent(user.value)+

    "&pass="+
    encodeURIComponent(pass.value)

  )

  .then(r=>r.json())

  .then(d=>{

    if(d.ok){

      login.style.display="none";

      panel.style.display="block";

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

let resumen={
ASISTENCIA:0,
TARDANZA:0,
FALTA:0
};

let html="";

data.reverse().forEach(d=>{

if(resumen[d.estado]!=null){

 resumen[d.estado]++;

}

html+=`

<tr>

<td>${d.nombre}</td>

<td>${d.grado}</td>

<td>${d.seccion}</td>

<td>${d.hora}</td>

<td>${d.estado}</td>

</tr>

`;

});

tabla.innerHTML=html;

asis.innerHTML=
resumen.ASISTENCIA;

tard.innerHTML=
resumen.TARDANZA;

falt.innerHTML=
resumen.FALTA;

graficos(resumen);

});

}


function graficos(r){

const data=[
r.ASISTENCIA,
r.TARDANZA,
r.FALTA
];

if(chartBar) chartBar.destroy();
if(chartPie) chartPie.destroy();

chartBar=new Chart(

document.getElementById("graficoBarras"),

{
type:'bar',
data:{
labels:[
'Asistencia',
'Tardanza',
'Falta'
],
datasets:[{data:data}]
}
});

chartPie=new Chart(

document.getElementById("graficoPastel"),

{
type:'pie',
data:{
labels:[
'Asistencia',
'Tardanza',
'Falta'
],
datasets:[{data:data}]
}
});

}


setInterval(()=>{

if(panel.style.display==="block"){

 cargar();

}

},5000);
