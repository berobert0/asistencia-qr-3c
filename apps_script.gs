function doGet(e){

  const lock = LockService.getScriptLock();

  try{

    lock.waitLock(5000);

    /********************************
     PANEL
    ********************************/
    if(e.parameter.tipo=="panel"){
      return obtenerPanel();
    }

    /********************************
     LOGIN
    ********************************/
    if(e.parameter.tipo=="login"){
      return login(e);
    }

    /********************************
     CODIGO QR
    ********************************/
    const codigo =
    String(e.parameter.codigo || "").trim();

    if(codigo==""){

      return json({
        estado:"ERROR",
        mensaje:"Código vacío"
      });

    }

    const ss =
    SpreadsheetApp.getActiveSpreadsheet();

    const hojaEst =
    ss.getSheetByName("ESTUDIANTES");

    const hojaAsi =
    ss.getSheetByName("ASISTENCIA");

    /********************************
     LEER ESTUDIANTES
    ********************************/
    const estudiantes =
    hojaEst.getDataRange().getValues();

    let alumno = null;

    for(let i=1;i<estudiantes.length;i++){

      const codigoBD =
      String(estudiantes[i][0]).trim();

      if(codigoBD == codigo){

        alumno = estudiantes[i];

        break;

      }

    }

    /********************************
     NO EXISTE
    ********************************/
    if(!alumno){

      return json({

        nombre:"NO ENCONTRADO",

        estado:"ERROR",

        mensaje:"Código inválido"

      });

    }

    /********************************
     DATOS ESTUDIANTE
    ********************************/
    const nombre = alumno[2];
    const aula = alumno[3];
    const foto = alumno[4];

    /********************************
     FECHA Y HORA
    ********************************/
    const ahora = new Date();

    const fecha =
    Utilities.formatDate(
      ahora,
      "America/Lima",
      "yyyy-MM-dd"
    );

    const hora =
    Utilities.formatDate(
      ahora,
      "America/Lima",
      "HH:mm:ss"
    );

    /********************************
     VALIDAR DUPLICADO
    ********************************/
    const registros =
    hojaAsi.getDataRange().getValues();

    for(let i=1;i<registros.length;i++){

      const codReg =
      String(registros[i][0]).trim();

      const fechaReg =
      registros[i][2];

      if(
        codReg == codigo &&
        fechaReg == fecha
      ){

        return json({

          nombre:nombre,

          estado:"DUPLICADO",

          mensaje:"Ya registró asistencia hoy",

          foto:foto

        });

      }

    }

    /********************************
     ESTADO
    ********************************/
    const estado =
    obtenerEstado(ahora);

    /********************************
     GUARDAR
    ********************************/
    hojaAsi.appendRow([

      codigo,
      nombre,
      fecha,
      hora,
      estado,
      "QR"

    ]);

    /********************************
     RESPUESTA
    ********************************/
    return json({

      nombre:nombre,

      estado:estado,

      mensaje:"Registro correcto",

      foto:foto,

      aula:aula

    });

  }

  catch(error){

    return json({

      estado:"ERROR",

      mensaje:error.toString()

    });

  }

}


/****************************************
 LOGIN
****************************************/
function login(e){

  const hoja =
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName("USUARIOS");

  const datos =
  hoja.getDataRange().getValues();

  for(let i=1;i<datos.length;i++){

    if(

      datos[i][0] == e.parameter.user &&

      datos[i][1] == e.parameter.pass

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


/****************************************
 PANEL
****************************************/
function obtenerPanel(){

  const hoja =
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName("ASISTENCIA");

  const datos =
  hoja.getDataRange().getValues();

  let lista = [];

  for(let i=1;i<datos.length;i++){

    lista.push({

      nombre:datos[i][1],

      hora:datos[i][3],

      estado:datos[i][4]

    });

  }

  return json(lista);

}


/****************************************
 HORARIO
****************************************/
function obtenerEstado(now){

  let minutos =

  now.getHours()*60 +

  now.getMinutes();

  /********************************
   7:40 - 8:00
  ********************************/
  if(
    minutos >= 460 &&
    minutos <= 480
  ){

    return "ASISTENCIA";

  }

  /********************************
   8:01 - 9:00
  ********************************/
  if(
    minutos >= 481 &&
    minutos <= 540
  ){

    return "TARDANZA";

  }

  /********************************
   MÁS DE 9:00
  ********************************/
  return "FALTA";

}


/****************************************
 JSON
****************************************/
function json(obj){

  return ContentService

  .createTextOutput(
    JSON.stringify(obj)
  )

  .setMimeType(
    ContentService.MimeType.JSON
  );

}
