function doGet(e){

  const codigo =
  e.parameter.codigo;

  const hoja =
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName(
    "ESTUDIANTES"
  );

  const datos =
  hoja.getDataRange()
  .getValues();

  const now =
  new Date();

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

  for(let i=1; i<datos.length; i++){

    let codigoBD =
    datos[i][0];

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

      // CONVERTIR DRIVE

      if(foto){

        if(
          foto.includes(
            "drive.google.com"
          )
        ){

          let match =
          foto.match(
            /\/d\/(.*?)\//
          );

          if(match && match[1]){

            foto =
            "https://drive.google.com/uc?export=view&id=" +
            match[1];

          }

        }

      }

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
          "REGISTRADO",

          foto:foto,

          fecha:fecha,
          hora:hora

        })

      )
      .setMimeType(
        ContentService
        .MimeType
        .JSON
      );

    }

  }

  return ContentService
  .createTextOutput(

    JSON.stringify({

      ok:false,

      nombre:"",

      estado:"",

      mensaje:
      "NO ENCONTRADO",

      foto:""

    })

  )
  .setMimeType(
    ContentService
    .MimeType
    .JSON
  );

}
