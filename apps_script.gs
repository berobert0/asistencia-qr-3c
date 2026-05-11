function doGet(e){

  // ==========================================
  // PANEL
  // ==========================================

  if(e.parameter.tipo == "panel"){

    return panel();

  }

  // ==========================================
  // CODIGO QR
  // ==========================================

  const codigo = e.parameter.codigo;

  // ==========================================
  // HOJA ESTUDIANTES
  // ==========================================

  const hoja =
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName("ESTUDIANTES");

  const datos =
  hoja.getDataRange().getValues();

  // ==========================================
  // FECHA Y HORA
  // ==========================================

  const now = new Date();

  const fecha =
  Utilities.formatDate(
    now,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );

  const hora =
  Utilities.formatDate(
    now,
    Session.getScriptTimeZone(),
    "HH:mm:ss"
  );

  // ==========================================
  // BUSCAR ESTUDIANTE
  // ==========================================

  for(let i=1; i<datos.length; i++){

    // ESTUDIANTES
    // 0 CODIGO
    // 1 DNI
    // 2 NOMBRE
    // 3 GRADO
    // 4 SECCION
    // 5 IMAGEN
    // 6 PADRE
    // 7 CELULAR
    // 8 ESTADO
    // 9 FOTO

    let codigoBD = datos[i][0];

    if(codigoBD == codigo){

      let nombre  = datos[i][2];
      let grado   = datos[i][3];
      let seccion = datos[i][4];
      let foto    = datos[i][9];

      // ==========================================
      // EVITAR DUPLICADOS
      // ==========================================

      const hojaAsistencia =
      SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("ASISTENCIA");

      const registros =
      hojaAsistencia
      .getDataRange()
      .getValues();

      let duplicado = false;

      for(let j=1; j<registros.length; j++){

        let cod = registros[j][0];
        let fec = registros[j][4];

        if(cod == codigo && fec == fecha){

          duplicado = true;
          break;

        }

      }

      // ==========================================
      // ESTADO
      // ==========================================

      let estado = duplicado
      ? "DUPLICADO"
      : "ASISTENCIA";

      // ==========================================
      // GUARDAR ASISTENCIA
      // ==========================================

      if(!duplicado){

        hojaAsistencia.appendRow([

          codigoBD,
          nombre,
          grado,
          seccion,
          fecha,
          hora,
          estado,
          "QR",
          ""

        ]);

      }

      // ==========================================
      // RESPUESTA
      // ==========================================

      return ContentService
      .createTextOutput(

        JSON.stringify({

          ok:true,

          codigo:codigoBD,
          nombre:nombre,
          grado:grado,
          seccion:seccion,

          estado:estado,

          mensaje:
          duplicado
          ? "YA REGISTRADO"
          : "REGISTRADO CORRECTAMENTE",

          foto:foto,

          fecha:fecha,
          hora:hora

        })

      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

    }

  }

  // ==========================================
  // NO ENCONTRADO
  // ==========================================

  return ContentService
  .createTextOutput(

    JSON.stringify({

      ok:false,

      nombre:"",
      estado:"",
      mensaje:"ESTUDIANTE NO ENCONTRADO",
      foto:""

    })

  )
  .setMimeType(
    ContentService.MimeType.JSON
  );

}


// ==========================================
// PANEL EN VIVO
// ==========================================

function panel(){

  const hoja =
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName("ASISTENCIA");

  const datos =
  hoja.getDataRange().getValues();

  datos.shift();

  let lista = [];

  datos.forEach(fila=>{

    lista.push({

      codigo : fila[0],
      nombre : fila[1],
      grado  : fila[2],
      seccion: fila[3],
      fecha  : fila[4],
      hora   : fila[5],
      estado : fila[6],
      origen : fila[7],
      obs    : fila[8]

    });

  });

  return ContentService
  .createTextOutput(
    JSON.stringify(lista)
  )
  .setMimeType(
    ContentService.MimeType.JSON
  );

}
