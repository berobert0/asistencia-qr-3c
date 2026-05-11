// ============================================
// APPS SCRIPT - apps_script.gs
// ============================================

function doGet(e){

  // ============================================
  // PARAMETRO QR
  // ============================================

  const codigo = e.parameter.codigo;

  // ============================================
  // HOJA
  // ============================================

  const hoja =
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName("ESTUDIANTES");

  const datos =
  hoja.getDataRange().getValues();

  // ============================================
  // FECHA Y HORA
  // ============================================

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

  // ============================================
  // RECORRER DATOS
  // ============================================

  for(let i=1; i<datos.length; i++){

    // COLUMNAS
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

    // ============================================
    // BUSCAR QR
    // ============================================

    if(codigoBD == codigo){

      let dni      = datos[i][1];
      let nombre   = datos[i][2];
      let grado    = datos[i][3];
      let seccion  = datos[i][4];
      let imagen   = datos[i][5];
      let padre    = datos[i][6];
      let celular  = datos[i][7];
      let estado   = datos[i][8];
      let foto     = datos[i][9];

      // ============================================
      // CONVERTIR GOOGLE DRIVE
      // ============================================

      if(foto){

        // SI ES LINK DRIVE
        if(foto.includes("drive.google.com")){

          let match =
          foto.match(/\/d\/(.*?)\//);

          if(match && match[1]){

            foto =
            "https://drive.google.com/uc?export=view&id=" +
            match[1];

          }

        }

      }

      // ============================================
      // RESPUESTA JSON
      // ============================================

      return ContentService
      .createTextOutput(

        JSON.stringify({

          ok:true,

          codigo:codigoBD,
          dni:dni,
          nombre:nombre,
          grado:grado,
          seccion:seccion,

          padre:padre,
          celular:celular,

          estado:"ASISTENCIA",

          mensaje:
          "REGISTRADO CORRECTAMENTE",

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

  // ============================================
  // NO ENCONTRADO
  // ============================================

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
