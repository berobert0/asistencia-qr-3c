function doGet(e){

  // ========================================
  // PANEL
  // ========================================

  if(e.parameter.tipo === "panel"){
    return obtenerPanel();
  }

  // ========================================
  // LOGIN
  // ========================================

  if(e.parameter.tipo === "login"){
    return login(e);
  }

  const lock =
  LockService.getScriptLock();

  try{

    lock.waitLock(5000);

    const ss =
    SpreadsheetApp.getActive();

    // ========================================
    // HOJAS
    // ========================================

    const hojaEst =
    ss.getSheetByName("ESTUDIANTES");

    const hojaAsi =
    ss.getSheetByName("ASISTENCIA");

    // ========================================
    // CODIGO QR
    // ========================================

    const codigo =
    String(
      e.parameter.codigo || ""
    ).trim();

    if(codigo === ""){

      return json({

        estado:"ERROR",
        mensaje:"QR vacío"

      });

    }

    // ========================================
    // BUSCAR ESTUDIANTE
    // ========================================

    const estudiantes =
    hojaEst.getDataRange()
    .getValues();

    let alumno = null;

    for(let i=1; i<estudiantes.length; i++){

      if(

        String(estudiantes[i][0]).trim()

        === codigo

      ){

        alumno = estudiantes[i];
        break;

      }

    }

    // ========================================
    // NO ENCONTRADO
    // ========================================

    if(!alumno){

      return json({

        estado:"ERROR",

        mensaje:"Alumno no encontrado",

        nombre:"NO REGISTRADO"

      });

    }

    // ========================================
    // DATOS
    // ========================================

    const nombre  = alumno[2];
    const grado   = alumno[3];
    const seccion = alumno[4];

    // FOTO = COLUMNA 9
    const foto    = alumno[9];

    // ========================================
    // FECHA Y HORA
    // ========================================

    const now = new Date();

    const fecha =
    Utilities.formatDate(

      now,

      "America/Lima",

      "yyyy-MM-dd"

    );

    const hora =
    Utilities.formatDate(

      now,

      "America/Lima",

      "HH:mm:ss"

    );

    // ========================================
    // ESTADO HORARIO
    // ========================================

    const estado =
    obtenerEstado(now);

    // ========================================
    // FUERA DE HORARIO
    // ========================================

    if(

      estado === "FUERA DE HORARIO" ||

      estado === "SIN CLASES"

    ){

      return json({

        nombre:nombre,

        estado:estado,

        mensaje:"Registro no permitido",

        foto:foto

      });

    }

    // ========================================
    // VALIDAR DUPLICADO
    // ========================================

    const asistencia =
    hojaAsi.getDataRange()
    .getValues();

    let duplicado =
    asistencia.find(f=>{

      let fechaFila =
      Utilities.formatDate(

        new Date(f[4]),

        "America/Lima",

        "yyyy-MM-dd"

      );

      return (

        String(f[0]).trim()
        === codigo &&

        fechaFila === fecha

      );

    });

    // ========================================
    // DUPLICADO
    // ========================================

    if(duplicado){

      return json({

        nombre:nombre,

        estado:"DUPLICADO",

        mensaje:"Ya registró hoy",

        foto:foto

      });

    }

    // ========================================
    // GUARDAR ASISTENCIA
    // ========================================

    hojaAsi.appendRow([

      codigo,
      nombre,
      grado,
      seccion,
      fecha,
      hora,
      estado,
      "QR",
      ""

    ]);

    // ========================================
    // ALERTAS
    // ========================================

    revisarAlertas(

      codigo,
      nombre

    );

    // ========================================
    // RESPUESTA
    // ========================================

    return json({

      nombre:nombre,

      estado:estado,

      mensaje:"Registro correcto",

      foto:foto

    });

  }

  catch(error){

    return json({

      estado:"ERROR",

      mensaje:error.toString()

    });

  }

  finally{

    lock.releaseLock();

  }

}


// ========================================
// LOGIN
// ========================================

function login(e){

  const hoja =
  SpreadsheetApp
  .getActive()
  .getSheetByName("USUARIOS");

  const datos =
  hoja.getDataRange()
  .getValues();

  for(let i=1; i<datos.length; i++){

    if(

      datos[i][0] === e.parameter.user &&

      datos[i][1] === e.parameter.pass

    ){

      return json({

        ok:true,

        rol:datos[i][2]

      });

    }

  }

  return json({

    ok:false

  });

}


// ========================================
// PANEL
// ========================================

function obtenerPanel(){

  const hoja =
  SpreadsheetApp
  .getActive()
  .getSheetByName("ASISTENCIA");

  const datos =
  hoja.getDataRange()
  .getValues();

  let lista=[];

  for(let i=1; i<datos.length; i++){

    lista.push({

      codigo : datos[i][0],
      nombre : datos[i][1],
      grado  : datos[i][2],
      seccion: datos[i][3],
      fecha  : datos[i][4],
      hora   : datos[i][5],
      estado : datos[i][6],
      origen : datos[i][7],
      obs    : datos[i][8]

    });

  }

  return json(lista);

}


// ========================================
// HORARIO
// ========================================

function obtenerEstado(now){

  const dia =
  now.getDay();

  // DOMINGO O SABADO

  if(

    dia === 0 ||

    dia === 6

  ){

    return "SIN CLASES";

  }

  let m =

  now.getHours()*60 +

  now.getMinutes();

  // 7:40 -> 12:40

  if(

    m < 460 ||

    m > 760

  ){

    return "FUERA DE HORARIO";

  }

  // ASISTENCIA

  if(m <= 480){

    return "ASISTENCIA";

  }

  // TARDANZA

  if(m <= 540){

    return "TARDANZA";

  }

  // FALTA

  return "FALTA";

}


// ========================================
// ALERTAS
// ========================================

function revisarAlertas(codigo,nombre){

  const ss =
  SpreadsheetApp.getActive();

  const hojaAsi =
  ss.getSheetByName("ASISTENCIA");

  const hojaAle =
  ss.getSheetByName("ALERTAS");

  const datos =
  hojaAsi.getDataRange()
  .getValues();

  let tardanzas = 0;
  let faltas = 0;

  for(let i=1; i<datos.length; i++){

    if(datos[i][0] == codigo){

      if(datos[i][6] == "TARDANZA"){

        tardanzas++;

      }

      if(datos[i][6] == "FALTA"){

        faltas++;

      }

    }

  }

  // ALERTA TARDANZA

  if(tardanzas >= 3){

    hojaAle.appendRow([

      new Date(),
      codigo,
      nombre,
      "TARDANZA",
      "3 tardanzas acumuladas",
      "MEDIO"

    ]);

  }

  // ALERTA DEMUNA

  if(faltas >= 5){

    hojaAle.appendRow([

      new Date(),
      codigo,
      nombre,
      "DEMUNA",
      "Posible abandono escolar",
      "ALTO"

    ]);

  }

}


// ========================================
// FALTANTES AUTOMATICOS
// ========================================

function marcarFaltantes(){

  const ss =
  SpreadsheetApp.getActive();

  const hojaEst =
  ss.getSheetByName("ESTUDIANTES");

  const hojaAsi =
  ss.getSheetByName("ASISTENCIA");

  const estudiantes =
  hojaEst.getDataRange()
  .getValues();

  const asistencia =
  hojaAsi.getDataRange()
  .getValues();

  const hoy =
  Utilities.formatDate(

    new Date(),

    "America/Lima",

    "yyyy-MM-dd"

  );

  let registrados = {};

  for(let i=1; i<asistencia.length; i++){

    let fechaFila =
    Utilities.formatDate(

      new Date(asistencia[i][4]),

      "America/Lima",

      "yyyy-MM-dd"

    );

    if(fechaFila === hoy){

      registrados[
        asistencia[i][0]
      ] = true;

    }

  }

  for(let i=1; i<estudiantes.length; i++){

    const codigo  = estudiantes[i][0];
    const nombre  = estudiantes[i][2];
    const grado   = estudiantes[i][3];
    const seccion = estudiantes[i][4];

    if(!registrados[codigo]){

      hojaAsi.appendRow([

        codigo,
        nombre,
        grado,
        seccion,
        hoy,
        "09:01:00",
        "FALTA",
        "TRIGGER",
        "Automático"

      ]);

    }

  }

}


// ========================================
// JSON
// ========================================

function json(obj){

  return ContentService

  .createTextOutput(

    JSON.stringify(obj)

  )

  .setMimeType(

    ContentService
    .MimeType
    .JSON

  );

}
