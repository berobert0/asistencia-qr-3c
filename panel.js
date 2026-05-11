const API_URL =
"https://script.google.com/macros/s/AKfycbyPbslr15y2s-jxxh5xUJ1PPw2ruyMp0pwI8sT8XXH8-dCTIn6_elkWc8Mla1tS7Lg/exec";

function cargar(){

  fetch(
    API_URL + "?tipo=panel"
  )

  .then(r=>r.json())

  .then(data=>{

    let html = "";

    data.reverse().forEach(d=>{

      html += `

      <tr>

        <td>${d.codigo}</td>

        <td>${d.nombre}</td>

        <td>${d.grado}</td>

        <td>${d.seccion}</td>

        <td>${d.fecha}</td>

        <td>${d.hora}</td>

        <td>${d.estado}</td>

      </tr>

      `;

    });

    document.getElementById(
      "tabla"
    ).innerHTML = html;

  })

  .catch(err=>{

    console.error(err);

  });

}

setInterval(cargar,3000);

cargar();
