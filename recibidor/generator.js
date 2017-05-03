// recibidor/generator
//-----------------------------
//
// Módulo para generar el archivo JSON a partir de un
// archivo con extensión CSV
// ====================================================

(function() {
  'use strict';

  exports.Generator = {
    jsonGenerator: function(file) {
      var jsonResult = [];
      var ids = [];
      var datas = file.split('\n');
      var titles = datas[0].replace(/"/g,"").split(",");
      var states = require('../datas/states.json');

      // En vez de iniciar con: 2017 - 2014
      // revierte a: 2014 - 2017
      // Para reemplazar datos anteriores
      datas.shift();
      datas.reverse();

      for (var i = 1; i <= datas.length - 1; i++) {
        var pureDatas = datas[i].replace(/"/g,"").split(',');
        // Seleccionador del estado por id de estado
        // menos 1 para que coincida con el indice del array
        var idState = pureDatas[11] - 1;
        var state = "";
        if (idState < 0) { state = states[0].name }
        else if (idState === 32) { state = states[31].name }
        else { state = states[idState].name }

        // Seleccionador de veredicto
        // Sentencia absolutoria = pureDatas[31]
        // Sentencia condenatoria = pureDatas[35]
        var veredict = "";
        if (pureDatas[31] === "S" && pureDatas[35] === "N") { veredict = "Sentencia absolutoria" }
        else if (pureDatas[31] === "N" && pureDatas[35] === "S") { veredict = "Sentencia condenatoria" }
        else if (pureDatas[31] === "N" && pureDatas[35] === "N") { veredict = "Sin sentencia" }
        else if (pureDatas[31] === "S" && pureDatas[35] === "S") { veredict = "Sentencia condenatoria y absolutoria" }

        var indexId = ids.indexOf(pureDatas[1]);
        if (indexId < 0) {
          // Agrega sólo el id para poder compararlo
          // en la otra vuelta
          ids.push(pureDatas[1]);
          
          // Agrega un elemento no existente aún
          // inde --> es el índice del json que contiene los datos completos
          jsonResult.push({
            "inde": i,
            "id": pureDatas[1],
            "date": pureDatas[0].substring(0, 10).trim(),
            "date_start": pureDatas[14],
            "status_process": pureDatas[2],
            "crime": pureDatas[3],
            "admin_unit": pureDatas[5],
            "mp": pureDatas[6],
            "verdict": veredict,
            "state": state,
            "changes": 0,
            "value": 1
          });
        } else {
          // Obtiene el índice del json que contiene el mismo id
          // que el json generado(jsonResult)
          var index_json = jsonResult[indexId].inde;
          // Se obtienen los datos de una carpeta anterior con el mismo id
          var datas_found = datas[index_json].replace(/"/g,"").split(',');

          // Reemplazar elemento y contar un cambio
          // inde --> es el índice del json que contiene los datos completos
          jsonResult[indexId] = {
            "inde": i,
            "id": pureDatas[1],
            "date": pureDatas[0].substring(0, 10).trim(),
            "date_start": pureDatas[14],
            "status_process": pureDatas[2],
            "crime": pureDatas[3],
            "admin_unit": pureDatas[5],
            "mp": pureDatas[6],
            "verdict": veredict,
            "state": state,
            "changes": jsonResult[indexId].changes + 1,
            "complete_changes": [],
            "value": 1
          };

          // Agregar elementos que no son iguales
          // ya que estos son cambios en la carpeta
          for (var j = 0; j <= pureDatas.length - 1; j++) {
            // Si los datos no son iguales, entonces...
            // ése es uno de los cambios que se deben agregar
            if (pureDatas[j] !== datas_found[j]) {
              jsonResult[indexId].complete_changes.push({
                "title_text": titles[j],
                "value": pureDatas[j]
              });
            }
          }
        }
      }

      // Abre el json generado en una ventana aparte
      window.open('data:application/json,' + escape(JSON.stringify(jsonResult)));
    }
  }
})();