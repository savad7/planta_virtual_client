
var controlLat;
var controlLon;
var auxShelf;
//var servidor = window.location.host;
var servidor = 'localhost:6080';
var servidorInteg = 'localhost:3000';
var token ="";

//var urlLojas = 'http://rdlabs-integ:8280/services/PLANTA_LOJA/getStore';
//var urlLojas = 'http://rdlabs-integ:8280/getStores'
var urlLojas = 'http://localhost:3000/ground_list/';
var urlLayers = 'http://localhost:3000/layer_list/';
var urlLayerConfg = 'http://localhost:3000/plan_layers';
var urlObjectConfg = 'http://localhost:3000/plan_objects';
var urlgetObjTemplates = 'http://localhost:3000/template_list/';
var urlsetObjTemplate = 'http://10.115.193.229:8285/geoPlantas/setObjTemplate/v1.0.0/';
var urlupdObjTemplate = 'http://10.115.193.229:8248/geoPlantas/updObjTemplate/v1.0.0/';


var objLojas = null;
var objLayers = {};
var objProduct = {};
var objProdutos = {};
var objDistancia = {"objetos":0, "pontos":[], "height":0};
var jsonProducts = {};
var jsonPosition = {};
var test = true;


function init(andar, shop){
  getStores(andar, shop);
  getLayers(andar, shop);

}


function setShelf(strShelf){
  auxShelf = strShelf;
  //alert("setToken: " + token);
}


function getShelf(){
  return auxShelf;
  //alert("setToken: " + token);
}




function getProduct(ean){
  
  $.each( jsonProducts.skus, function( key, val ) {
    if (ean == val[key].id){
      return val[key];
    }
    return {};
  });
}




function fnTeste(){
  lat = document.getElementById('txLat').value;
  lon = document.getElementById('txLon').value;
  var Coord = ol.proj.transform([parseInt(lat), parseInt(lon)], 'EPSG:3857', 'EPSG:4326');
  document.getElementById('txCoord1').value = Coord;
  var Coord = ol.proj.transform([parseInt(lat), parseInt(lon)], 'EPSG:4326 ', 'EPSG:3857');
  document.getElementById('txCoord2').value = Coord;
  var Coord = ol.proj.transform([parseInt(lat), parseInt(lon)], 'EPSG:3857 ', 'EPSG:900913');
  document.getElementById('txCoord3').value = Coord;
}

function criaPonto(lon, lat){
  trackThis = viewer.entities.add({
    //position : Cesium.Cartesian3.fromDegrees(-43.173694, -22.963902),
    position : Cesium.Cartesian3.fromDegrees(parseInt(lon),parseInt(lat)),
    point : {
      pixelSize : 10,
      color : Cesium.Color.YELLOW
    }
  });
  viewer.zoomTo(trackThis);
}


function controlMenu(){
  
  classStyle = document.getElementById("menuContainer").className;
  if(classStyle == 'menuClose'){
    //document.getElementById("cesiumContainer").className = 'cesiumContainerColse';
    document.getElementById("menuContainer").className = 'menuOpen';
    
  }
  if(classStyle == 'menuOpen'){
    document.getElementById("menuContainer").className = 'menuClose';
    //document.getElementById("cesiumContainer").className = 'cesiumContainerOpen';
  }
}

function getLojaSelecionada(){
  return document.getElementById('txtLoja').options[document.getElementById('txtLoja').selectedIndex].value;
}

function getPavimentoSelecionado(){
  return document.getElementById('pavimento').options[document.getElementById('pavimento').selectedIndex].value;      
}

function getDownloadURL(obj){
  loja = getLojaSelecionada();
  piso = getPavimentoSelecionado();
  obj.href = 'http://localhost:6080/geoserver/mapa_loja/wfs?request=GetFeature&typeName=vw_base,vw_departamento,vw_gondola&outputFormat=dxf&format_options=layers:'+loja+'.'+piso+'.BASE,'+loja+'.'+piso+'.DEPARTAMENTO,'+loja+'.1.GONDOLA&viewparams=piso:'+piso+';loja:'+loja+'&srs=EPSG:4326';

}



function prop(obj){
  var str;
  str = str + "<table class='cesium-infoBox-defaultTable'>";
  str = str + " <tr><td>ID</td><td>"+obj.properties.NU_OBJETO+"</td></tr>";
  str = str + " <tr><td>Coordinates</td><td>"+obj.geometry.coordinates+"</td></tr>";
  str = str + " <tr><td>CONFG</td><td>"+obj.properties.CUSTOM_CONFG+"</td></tr>";
  str = str + "</table><br><br><br>";
  return str;
}

function prop2(obj){
  var str;
  str = str + "<table class='cesium-infoBox-defaultTable'>";
  str = str + " <tr><td>[0][0]</td><td>"+obj.geometry.coordinates[0][0][0]+"</td></tr>";
  str = str + " <tr><td>[0][1]</td><td>"+obj.geometry.coordinates[0][1][0]+"</td></tr>";
  str = str + " <tr><td>[1][0]</td><td>"+obj.geometry.coordinates[1]+"</td></tr>";
  str = str + " <tr><td>[1][1]</td><td>"+obj.geometry.coordinates[1]+"</td></tr>";

  str = str + "</table><br><br><br>";
  return str;
}




function setHeader(xhr) {
 
  xhr.setRequestHeader("Authorization", "Bearer " + token);
}

function validaCampo(campo,obj){
  var retorno = false;
  for (var key in obj){
    if (key == campo){
      retorno = true;
      break;
    }
  }
  return retorno;
}
          
function desenhaLayer(strUrl, objLayer, objPai, foco){
   var confgLayer = JSON.parse(objLayer.custom_confg);



   $.ajax({
    url: strUrl,
    dataType: 'json',
    success: function( data ) {
      $.each( data.features, function( key, val ) {
        var idObj = val.properties.id;
        var confg = JSON.parse(val.properties.custom_confg);
        
        coord = val.geometry.coordinates[0];
        
        if(validaCampo("wallpaper_posBase",confg)){
          var objMatrial = null;
          if (confg.wallpaper_cor != "null"){
            objMatrial = new Cesium.Color.fromCssColorString(confg.wallpaper_cor);
          }else{          
            objMatrial = new Cesium.ImageMaterialProperty({image: confg.wallpaper_img});
          }
          
          
          if (confg.wallpaper_invert == "true"){
            var w_x = Number(confg.wallpaper_posBase);
            var w_x2 = Number(confg.wallpaper_posBase)+1;
          }else{
            var w_x = Number(confg.wallpaper_posBase)+1;
            var w_x2 = Number(confg.wallpaper_posBase);
          }

          if (confg.wallpaper_fix == "true"){
            var plusX = 0.0000001;
            var plusY = 0;
          }else{
            var plusX = 0;
            var plusY = 0.0000001;
          }

          

        }
       

        var nuExtruded = 0;
        var nuAltura = 0;
        var cor = "#FF00FF";
        var alpha = 1;
        var visibilidade_inicial = 'hidden';
        var cor_borda = "#000000";


        if(validaCampo("extruded",confgLayer)){
          nuExtruded = Number(confgLayer.extruded);
        }

        if(validaCampo("altura",confgLayer)){
          nuAltura = Number(confgLayer.altura);
        }

        if(validaCampo("cor",confgLayer)){
          cor = confgLayer.cor;
        }

        if(validaCampo("cor_borda",confgLayer)){
          cor_borda = confgLayer.cor_borda;
        }
        
        if(validaCampo("alpha",confgLayer)){
          alpha = Number(confgLayer.alpha);
        }

        if(validaCampo("visibilidade_inicial",confgLayer)){
          visibilidade_inicial = confgLayer.visibilidade_inicial;
        }

        

        if (val.properties.custom_confg != null){
          if(validaCampo("extruded",confg)){
            nuExtruded = Number(confg.extruded);
          }

          if(validaCampo("altura",confg)){
            nuAltura = Number(confg.altura);
          }

          if(validaCampo("cor",confg)){
            cor = confg.cor;
          }

          if(validaCampo("cor_borda",confg)){
            cor_borda = confg.cor_borda;
          }

          if(validaCampo("alpha",confg)){
            alpha = Number(confg.alpha);
          }
          if(validaCampo("visibilidade_inicial",confg)){
            visibilidade_inicial = confg.visibilidade_inicial;
          }
        }
        
        var idObj = val.properties.id;

        

        trackHome = viewer.entities.add({
          name : idObj,
          id : idObj,
          parent : objPai,
          //description : formObject([formConfg(confgObj, confgLayer)]),
          description : formConfg(idObj, val, objLayer),
          //description : "Sem Conteudo",
          polygon : {
              hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(getArray(val.geometry.coordinates[0]))),
              outline : true,
              outlineColor : Cesium.Color.fromCssColorString(cor_borda),
              //outlineColor : Cesium.Color.fromCssColorString(cor),
              outlineWidth :1,
              extrudedHeight : nuExtruded + nuAltura,
              height : nuAltura,
              material : Cesium.Color.fromAlpha(Cesium.Color.fromCssColorString(cor), alpha) 
          },
        });
        if(foco == true){
          viewer.zoomTo(trackHome);
        }
        if (visibilidade_inicial == 'visible'){
          entidades.getById(idObj).show = true; 
        }
      });
    },
    error: function( data ) {
      //alert( "ERROR:  " + data );
    },
    beforeSend: setHeader
  });  
}


function desenhaLayerModelo(strUrl, objLayer, objPai){
  var confgLayer = JSON.parse(objLayer.custom_confg);
  $.ajax({
    url: strUrl,
    dataType: 'json',
    success: function( data ) {
      $.each( data.features, function( key, val ) {
        //alert(val.properties.CUSTOM_CONFG);
        confg = JSON.parse(val.properties.custom_confg);
        var cAngl = 1; 
        var nuAltura = 1; 
        var strModelo = "";
        var nuExtruded = 0;
        var alpha = 1;
        var cor = "#0000FF";
        var useModel = "true";
        
        if(validaCampo("extruded",confgLayer)){
          nuExtruded = Number(confgLayer.extruded);
        }

        if(validaCampo("angulo",confgLayer)){
          cAngl = Number(confgLayer.angulo);
        }

        if(validaCampo("modelo",confgLayer)){
          strModelo = confgLayer.modelo;
        }

        if(validaCampo("altura",confgLayer)){
          nuAltura = Number(confgLayer.altura);
        }

        if(validaCampo("cor",confgLayer)){
          cor = confgLayer.cor;
        }

        if(validaCampo("alpha",confgLayer)){
          alpha = confgLayer.alpha;
        }
        
        if(validaCampo("use_model",confgLayer)){
          useModel = confgLayer.use_model;
        }

        if (val.properties.custom_confg){

          if(validaCampo("extruded",confg)){
            nuExtruded = Number(confg.extruded);
          }

          if(validaCampo("angulo",confg)){
            cAngl = Number(confg.angulo);
          }

          if(validaCampo("modelo",confg)){
            strModelo = confg.modelo;
          }

          if(validaCampo("altura",confg)){
            nuAltura = Number(confg.altura);
          }

          if(validaCampo("cor",confg)){
            cor = confg.cor;
          }

          if(validaCampo("alpha",confg)){
            alpha = confg.alpha;
          }

          if(validaCampo("use_model",confg)){
            useModel = confg.use_model;
          }
        }
        //alert(useModel);
        if (useModel == "false"){
          trackHome = viewer.entities.add({
            name : idObj,
            id : idObj,
            parent : objPai,
            //description : formObject([formConfg(confgObj, confgLayer)]),
            description : formConfg(idObj, val, objLayer),
            //description : "Sem Conteudo",
            polygon : {
                hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(getArray(val.geometry.coordinates[0]))),
                outline : true,
                outlineColor : Cesium.Color.fromCssColorString(cor),
                outlineWidth : 1,
                extrudedHeight : nuExtruded + nuAltura,
                height : nuAltura,
                material : Cesium.Color.fromAlpha(Cesium.Color.fromCssColorString(cor), alpha) 
            },
          });
        }

        if (useModel == "true"){
          posGeom = Cesium.BoundingSphere.fromPoints(Cesium.Cartesian3.fromDegreesArray(getArray(val.geometry.coordinates[0]))).center;
          pos = getCartesian(posGeom, nuAltura);

          var referencia = Cesium.Cartesian3.fromDegrees(0.0, 0.0);
          var myObj = Cesium.Cartesian3.fromDegreesArray(getArray(val.geometry.coordinates[0]))
          var angle = Cesium.Cartesian3.angleBetween(referencia, posGeom);
          var heading = Cesium.Math.toRadians(cAngl * angle);
          //var heading = Cesium.Math.toRadians(angle);
          var pitch = 0;
          var roll = 0;
          var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
          var orientation = Cesium.Transforms.headingPitchRollQuaternion(pos, hpr);
          //alert(cAngl +" aa " + strModelo +" aa " + nuAltura +" aa " + cor +" aa " + alpha);
          
          var idObj = val.properties.NU_OBJETO;
          track = viewer.entities.add({
            name : idObj,
            id : idObj,
            parent : objPai,
            position : pos,
            orientation : orientation,
            //description : formObject([formConfg(confg, confgLayer)]),
            description : formConfg(idObj, val, objLayer),
            model : {
                uri : strModelo,
                minimumPixelSize : 360,
                maximumPixelSize : 360,
                scale: Number(confgLayer.maxScale),
                maximumScale : Number(confgLayer.maxScale)
            }
          });
          //viewer.zoomTo(track);
          //viewer.entities.removeById('TempEntity');
        }


      });
    },
    error: function( data ) {
      //alert( "ERROR:  " + data );
    },
    beforeSend: setHeader  
  });
}


//----------------------------------------------------------------------------

function urlPolygon(piso, loja, layer){
  //return 'http://'+ servidor +'/geoserver/mapa_loja/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_mapa_loja:vw_planta_polygon&outputFormat=application%2Fjson&viewparams=piso:'+piso+';loja:'+loja +';layer:'+ layer; //Geoserver URL  
  return 'http://'+ servidor +'/geoserver/brMalls/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=brMalls:vw_polygon&outputFormat=application%2Fjson&viewparams=floor:'+piso+';loja:'+loja +';layer:'+ layer; //Geoserver URL  
  //return 'https://'+ servidorInteg +'/geoPlantas/layers/v1.0.0/polygon/'+loja+'/'+piso+'/'+layer
}

function urlLinestring(piso, loja, layer){
  //return 'http://'+ servidor +'/geoserver/mapa_loja/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_mapa_loja:vw_planta_linestring&outputFormat=application%2Fjson&viewparams=piso:'+piso+';loja:'+loja +';layer:'+ layer; //Geoserver URL  
  return 'http://'+ servidor +'/geoserver/brMalls/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=brMalls:vw_polygon&outputFormat=application%2Fjson&viewparams=floor:'+piso+';loja:'+loja +';layer:'+ layer; //Geoserver URL  
  //return 'https://'+ servidorInteg +'/geoPlantas/layers/v1.0.0/linestring/'+loja+'/'+piso+'/'+layer
}


function getArray(val){
  var arr = []; 
  for (var i = 0; i < val.length; i++){
  //for (var i = val.length - 1; i > 0; i--){
    //alert(i + " - " + val.length + ": " + val[i]);
    arr.push(val[i][0]);arr.push(val[i][1]);

  }
  return arr;
}


function getCartesian(cartesianPosition, height){
  var center = cartesianPosition;
  var center = Cesium.Cartesian3.fromElements(center.x,center.y,center.z);

  var ellipsoid = Cesium.Ellipsoid.WGS84;
  var cart = ellipsoid.cartesianToCartographic(center);
  
  //alert(cart.latitude +","+cart.longitude +","+cart.height+"\n" + Cesium.Math.toDegrees(cart.latitude) +","+ Cesium.Math.toDegrees(cart.longitude) +","+ Cesium.Math.toDegrees(cart.height)+"\n" + center.x +","+center.y +","+center.z );
  
  var x = Cesium.Math.toDegrees(cart.longitude);
  var y = Cesium.Math.toDegrees(cart.latitude);
  var z = height;
  //var pos = [x,y,z];
  pos = Cesium.Cartesian3.fromDegrees(x,y,z);
 

  //alert(pos);
  return pos;
}

function computeCircle(radius) {
    var positions = [];
    for (var i = 0; i < 360; i++) {
        var radians = Cesium.Math.toRadians(i);
        positions.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
    }
    return positions;
}







function setAba(obj){

      abas = document.querySelectorAll('#abas span');
      for(i = 0; i<=abas.length-1; i++){
        abas[i].style.zIndex = "-1";
      }
      span = document.querySelectorAll('#'+obj+' span');
      span[0].style.zIndex = "1"
}

function formObject(arrayStr){
  var str = "";
  str = str + "<ul id='abas' class='abas'>";
  for (y = 0; y < arrayStr.length; y++) {
    str = str + arrayStr[y];
  }
  str = str + "</ul>";
  str = str + "<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>";

  return str;
}


function setCustomConfg(idForm, objId){

  var keys = document.querySelectorAll('#'+idForm+' .jsonField');
  var strJson = '{';
  for(var i = 0; i<keys.length; i++){
      var key = keys[i].value;
      //var val = document.getElementById('val_'+ key).value;
      var val = document.querySelector('#'+idForm+' #val_'+ key).value;
      //alert(i +" - " + key + ":" + val);
      strJson += '"'+key+'":"'+val+'"';
      if (i<keys.length-1){
        strJson += ',';
      }
  }
  strJson += '}';
  var encodedData = window.btoa(strJson);
  var url = ""; 
  if (idForm == "fieldsLayers"){url = urlLayerConfg+"/"+objId }
  if (idForm == "fieldsObjs"){url = urlObjectConfg+"/"+objId; }

  //alert(objId +"-"+strJson);
  //strJson = strJson.replace(/"/g, '\\"');
  jsonConfg = '{"custom_confg": \"'+encodedData+'\"  }'
  //alert(urlLayerConfg+ "\n"+jsonConfg);
  var xhr = new XMLHttpRequest();
  xhr.open("PUT", url, true);
  xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
  xhr.onload = function () {
    var users = xhr.responseText;
    if (xhr.readyState == 4 && xhr.status == "200") {
      alert(users);
    } else {
      alert(users);
    }
  }
  xhr.send(jsonConfg);

}

function removeElement(row) {
// Removes an element from the document.
//var element = document.getElementById(elementId);
//element.parentNode.removeChild(element);
//document.getElementById(tb).deleteRow(row);
var element = document. getElementById(row);
element.parentNode.removeChild(element);
//alert(document.getElementById(tb).rows.namedItem(row).rowIndex);

}

function incluiElemento(tb, idObj){
  var table = document.getElementById(tb);
  var row = table.insertRow(table.rows.length);
  row.id = "row_"+idObj;
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var newField = document.getElementById(idObj).value;
  document.getElementById(idObj).value = "";
  cell1.innerHTML = "<input type='text' id='key_"+newField+"' name='key_"+newField+"' value='"+newField+"' class='jsonField'>:";
  cell2.innerHTML = "<input type='text' id='val_"+newField+"' name='val_"+newField+"' value=''>";
  cell3.innerHTML = "<div onclick=\"removeElement('row_"+idObj+"')\">-</div>";
}

function incluiElementoTemplate(tb, key, val){
  var table = document.getElementById(tb);
  var row = table.insertRow(table.rows.length);
  row.id = "row_"+key;
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  cell1.innerHTML = "<input type='text' id='key_"+key+"' name='key_"+key+"' value='"+key+"' class='jsonField'>:";
  cell2.innerHTML = "<input type='text' id='val_"+key+"' name='val_"+key+"' value='"+val+"'>";
  cell3.innerHTML = "<div onclick=\"removeElement('row_"+key+"')\">-</div>";
}

function setCustoConfgFromObjTemplate(tb, strJson){
  var objJson = JSON.parse(window.atob(strJson));
  for (var key in objJson){
    incluiElementoTemplate(tb, key, objJson[key]);
  }
  alert(window.atob(strJson));
}

function templatePopUp(show){
  if (show){
    document.getElementById("popTemplate").style.visibility='visible';
  }else{
    document.getElementById("popTemplate").style.visibility = 'hidden';
    document.getElementById("tbObjTemplates").innerHTML = "";
  }
}

function getObjTemplate(tb){
  templatePopUp(true);
  var table = document.getElementById("tbObjTemplates");
  
  var count = 0;
  $.ajax({
    url: urlgetObjTemplates,
    method: 'GET',
    crossDomain: true,
    dataType: 'json',
    success: function( data ) {
        $.each( data.plan_templates, function( key, val ) {
            var row = table.insertRow(table.rows.length);
            row.id = "row_"+count;
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var encodedData = window.btoa(val.template);
            cell1.innerHTML = "<input type='button' id='"+val.id+"' name='"+val.id+"' value='"+val.name+"' onclick=\" setCustoConfgFromObjTemplate('"+tb+"', '"+encodedData+"'); templatePopUp(false);\">";
            cell2.innerHTML = val.template;
            count++;
        });
        var row = table.insertRow(table.rows.length);
        row.id = "row_"+count;
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<input type='button' id='None' name='None' value='Nenhum' onclick=\"templatePopUp(false); \">";
        cell2.innerHTML = "";
    },

  });
}

function formConfg(idObj, obj, layer){

  //if(obj){
  //  if (obj.properties.CUSTOM_CONFG){
      var jsonObj = JSON.parse(obj.properties.custom_confg);
  //  }
  //}else{
  //  alert(layer.title);
  //}

  var jsonLayer = JSON.parse(layer.custom_confg);

  var str;
  var contador = 0
  var cabecalho = obj.properties.id;

  if (idObj != ""){cabecalho = idObj}
  str = str + "<div style='width:100%; height:30px; background-color:#000000;z-index:-1; position:absolute; top:0px'><center>"+ layer.title+ " - " +idObj+ " - " +obj.properties.plan_ground_id+"</center></div>"
  str = str + "<ul id='abas' class='abas'>";
  //------------------------------------------------------------------------------------Design Layer----------------
  str = str + "    <li class='aba' id='aba3'>";
  str = str + "     <p id='paba1' onclick=\"setAba('aba3')\">Design Layer<br></p>";
  str = str + "     <span class='abaConteudo'> ";
  str = str + "       <form name='fieldsLayers' id='fieldsLayers'><BR>";
  str = str + "       <input type='text' id='newFieldLayers' value=''><input type='button' value='+' onclick=\"incluiElemento('tbFieldsLayers', 'newFieldLayers')\"><BR><BR>";
  str = str + "       <input type='button' value='Template' onClick=\"getObjTemplate('tbFieldsLayers')\">"
  str = str + "           <table id=tbFieldsLayers>";
    for (var key in jsonLayer) {
        str = str + "             <tr id='row_"+key+"'>";
        str = str + "               <td><input type='text' id='key_"+ key +"' name='key_"+ key +"' value='"+ key +"' class='jsonField'>:</td>";
        str = str + "               <td><input type='text' id='val_"+ key +"' name='val_"+ key +"' value='"+ jsonLayer[key] +"'></td>";
        str = str + "               <td valign='center'><div onclick=\"removeElement('row_"+key+"')\">-</div></td>";
        str = str + "             </tr>";
        contador++;
    }
   
  str = str + "           </table>";
  str = str + "            <br> <input type='button' onclick=\"setCustomConfg('fieldsLayers', "+ layer.id +")\" value='Salvar'>";
  str = str + "       </form>";
  str = str + "     </span></li>";
//--------------------------------------------------------------------------------------Design Objeto--------------
  contador = 0 
  
    str = str + "    <li class='aba' id='aba4'>";
    str = str + "     <p id='paba2' onclick=\"setAba('aba4')\">Design Objeto</p>";
    //str = str + "     <p id='p-aba-2'>Editar</p>";
    str = str + "     <span class='abaConteudo'> ";

    str = str + "       <form name='fieldsObjs' id='fieldsObjs'><BR>";
    str = str + "       <input type='text' id='newFieldObj' value=''><input type='button' value='+' onclick=\"incluiElemento('tbFieldsObjs', 'newFieldObj')\"><BR><BR>";
    str = str + "       <input type='button' value='Template' onClick=\"getObjTemplate('tbFieldsObjs')\">"
    str = str + "           <table id='tbFieldsObjs'>";
    if (jsonObj){
      for (var key in jsonObj) {
        str = str + "             <tr id='row_"+key+"'>";
        str = str + "               <td><input type='text' id='key_"+ key +"' name='key_"+ key +"' value='"+ key +"' class='jsonField'>:</td>";
        str = str + "               <td><input type='text' id='val_"+ key +"' name='val_"+ key +"' value='"+ jsonObj[key] +"'></td>";
        str = str + "               <td valign='center'><div onclick=\"removeElement('row_"+key+"')\">-</div></td>";
        str = str + "             </tr>";
        contador++;
      }
    } 
    str = str + "           </table>";
    str = str + "            <br> <input type='button' onclick=\"setCustomConfg('fieldsObjs', "+ obj.properties.NU_OBJETO +")\" value='Salvar'>";
    str = str + "       </form>";
    str = str + "     </span></li>";
  
//---------------------------------------------------------------------------------------Associacao / Produto-----------
  if (layer.CO_TIPO == "Shelf"){
    
    str = str + "    <li class='aba' id='aba2'>";
    str = str + "     <p id='paba2' onclick=\"setAba('aba2')\">Associacao</p>";
      str = str + "     <span class='abaConteudo'> ";
    str = str + "     <div onclick='associaGond();' style='cursor: pointer;'>Editar</div>";
    str = str + "     <input type='hidden' id='operStatus' name='operStatus' value='ver'>";
    str = str + "       <form>";
    str = str + "           <table>";
    str = str + "             <tr><td>Shelf(BL):</td><td><input class='inputViewMode' type='text' id='shelf' name='shelf' readonly value='null'></td></tr>";
    str = str + "             <tr><td>Etiqueta:</td><td><input class='inputViewMode' type='text' id='etiqueta' name='etiqueta' readonly value='null'></td></tr>";
    str = str + "             <tr><td>Prosicao:</td><td><input class='inputViewMode' type='text' id='posicao' name='posicao' value='"+obj+"' readonly></td></tr>";
    str = str + "           </table>";
    str = str + "            <br> <input type='button' name='' onclick='setGondAssoc();' id='btnAssociaGond' value='OK' style='visibility : hidden;'>";
    str = str + "       </form>";
    str = str + "     </span></li>";
    str = str + "    <li class='aba' id='aba1'>";
    str = str + "     <p id='paba1' onclick=\"setAba('aba1')\">Produto<br></p>";
    str = str + "     <span class='abaConteudo'> ";
    str = str + "           <table id='tbProdutos'>";

    str = str + "           </table>";
    str = str + "     </span></li>";
  }
  //----------------------------------------------------------------------------------------------------
  str = str + "</ul>";

  if(layer.CO_TIPO == '3dCam'){
    var idFOV = "camFOV_"+obj.properties.NU_OBJETO;
    str = str + "<input type='button' onClick=\"viewer.entities.getById('"+idFOV+"').show = !viewer.entities.getById('"+idFOV+"').show\" value='Field of View'>";
  }

  return str;

}

function carregaProd(idTabela, idObj){
  var objShelf = JSON.parse(document.getElementById("hdn_"+idObj+"_2").value);
  var table = document.getElementById(idTabela);

  for(var key in objShelf){
    var row = table.insertRow(table.rows.length);
    var cell0 = row.insertCell(0); var cell1 = row.insertCell(1);
    cell0.innerHTML = key;          
    if (key == "thumbnails"){
      cell1.innerHTML = "<img src='"+objShelf[key]+"' style='max-height: 50px;'>";
    }else{
      cell1.innerHTML = objShelf[key];
    }
  }
}


function associaGond(){
  var operStatus = document.getElementById("operStatus");
  var etiqueta = document.getElementById("etiqueta");
  var shelf = document.getElementById("shelf");
  var btnControl = document.getElementById("btnAssociaGond");
  //alert('hola' +' - '+ shelf.value +' - '+ etiqueta.value +' - ' + operStatus.value);
  if (operStatus.value == "ver"){

    operStatus.value = "editar";
    etiqueta.className  = 'inputEditMode';
    shelf.className  = 'inputEditMode';

    etiqueta.readOnly   = false;
    shelf.readOnly   = false;
    btnControl.style.visibility = 'visible';

  }else if (operStatus.value == "editar"){
    operStatus.value = "ver";
    etiqueta.className  = 'inputViewMode';
    shelf.className  = 'inputViewMode';

    etiqueta.readOnly = true;
    shelf.readOnly = true;
    btnControl.style.visibility = 'hidden';
  }
}


function getGondAssocShelf(txtObj){
  var retorno = "";
  $.ajax({
    url: urlGondAssoc+txtObj,
    method: 'GET',
    crossDomain: true,
    dataType: 'json',
    success: function( data ) {
        
        $.each( data.Gondolas.Gondola, function( key, val ) {
          setShelf(val.SHELF_BLN);
          //alert(retorno);
        });
    },
    beforeSend: setHeaderAccept
  });
  //alert(retorno);
  
}

function getGondAssoc(txtObj){
  //alert(urlGondAssoc+obj.posicao.value);
  $.ajax({
    url: urlGondAssoc+txtObj,
    method: 'GET',
    crossDomain: true,
    dataType: 'json',
    success: function( data ) {
        var etiqueta = document.getElementById("etiqueta");
        var shelf = document.getElementById("shelf");
        var posicao = document.getElementById("posicao");
        posicao.value = txtObj;
        $.each( data.Gondolas.Gondola, function( key, val ) {
          //alert(key +' - ' + val.DE_LOJA);
          etiqueta.value = val.CO_ETIQUETA;
          shelf.value = val.SHELF_BLN;
        });
    },
    beforeSend: setHeaderAccept
  });
}

function setGondAssoc(){
  var etiqueta = document.getElementById("etiqueta").value;
  var shelf = document.getElementById("shelf").value;
  var posicao = document.getElementById("posicao").value;
  //alert(urlGondola+posicao+"/"+etiqueta+"/"+shelf);

  /*$.ajax({
    url: urlGondola+posicao+"/"+etiqueta+"/"+shelf,
    method: 'GET',
    crossDomain: true,
    dataType: 'json',
    success: function( data ) {
        alert(data[0]);
    },
    beforeSend: setHeaderAccept
  });*/

  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var data = this.responseText;
      alert(data);
    }
  };
  xmlhttp.open("GET", urlGondola+posicao+"/"+etiqueta+"/"+shelf, true);
  xmlhttp.setRequestHeader("Authorization", "Bearer " + token);
  xmlhttp.send();
}





function setHeaderAccept(xhr) {
  //xhr.setRequestHeader("Accept", "application/json");
  //xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  //xhr.setRequestHeader("Access-Control-Allow-Credentials", true);
  //xhr.setRequestHeader("Access-Control-Request-Method", "GET");
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.setRequestHeader('Accept', 'application/json');
  
}

function setFloors(obj, andar){
  var totalFloors = '0';
  var element = document.getElementById("pavimento");
  var len = element.options.length;
  for(i = 0; i<=len; i++){
    element.options[0] = null;
  }

  var selLoja = document.getElementById("txtLoja").value;
  $.each( obj, function( key, val ){
    if (val.plan == selLoja){
      totalFloors = val.floors;
    }
  });
  //alert(totalFloors + " - " + selLoja);
  for (var i = 1; i <= totalFloors; i++) {

    var para = document.createElement("option");
    para.setAttribute("value", i)
    if (andar == i){
      para.setAttribute("selected", "true")
    }
    var node = document.createTextNode(i);
    para.appendChild(node);
    element.appendChild(para);
  }
}

function getStores(andar, loja){
  var data2;
  $.ajax({
    url: urlLojas,
    method: 'GET',
    crossDomain: true,
    dataType: 'json',
    success: function( data ) {
        var element = document.getElementById("txtLoja");
        var len = element.options.length;
        for(i = 0; i<=len; i++){
          element.options[0] = null;
        }
        $.each( data.plan_grounds, function( key, val ) {
          //alert(key +' - ' + val.DE_LOJA);
            confg = JSON.parse(val.custom_confg);
            if (confg.visibility == "visible"){
              var para = document.createElement("option");
              para.setAttribute("value", val.plan)
              var node = document.createTextNode(val.plan);
              para.appendChild(node);
              if (loja == val.plan){
                para.setAttribute("selected", "true")
              }              
              element.appendChild(para);
            }
        });
        objLojas = data.plan_grounds;
        var att = document.createAttribute("onChange");       // Create a "class" attribute
        att.value = "setFloors(objLojas, "+andar+")";
        element.setAttributeNode(att)
        setFloors(objLojas, andar);
    },
    beforeSend: setHeaderAccept
  });
}

 
function getLayers(andar, loja){

  entidades.removeAll();

  $.ajax({
    url: urlLayers+loja+'/'+ andar,
    method: 'GET',
    crossDomain: true,
    dataType: 'json',
    success: function( data ) {
        var element = document.getElementById("tbLayer");
        var x = element.rows.length

        for (var i = 0; i < x; i++) {
          element.deleteRow(0);
        }

        var tblBody = document.createElement("tbody");
        var tr = document.createElement("tr");
        coutCol = 1;
        var count = 1;
        //alert((data.plan_layers.length+2)%3);
        var strURLdxf = "http://"+servidor+"/geoserver/brMalls/wfs?service=WFS&version=1.0.0&request=GetFeature&outputFormat=dxf&srs=EPSG:4326&";
        var strtypeName = "&typeName=";
        var strFormatOptions= "&format_options=layers:";
        var strViewParams="&";

        var strURLpdf = "http://"+servidor+"/geoserver/brMalls/wms?service=WMS&version=1.1.0&request=GetMap&bbox=-43.2357767198501%2C-22.9226830987681%2C-43.2348528922855%2C-22.9212049017514&width=479&height=768&srs=EPSG%3A4326&format=application%2Fpdf";
        var strLayersParam = "&layers=";
        var strCQLfilter = "&cql_filter=";
        

        $.each( data.plan_layers, function( key, val ) {
          //alert(key +' - ' + val.title);
          
          //------------------------------------------url PDF-----------------------------------------------------
          var virgola = ",";
          var pontoEvirgola = ";";
          if (count >= data.plan_layers.length){
            virgola = "";
            pontoEvirgola = "";
          }

          strLayersParam = strLayersParam + "brMalls:vw_polygon_cql" + virgola;
          strCQLfilter = strCQLfilter + "INCLUDE;(shopping='" + loja + "' "
          strCQLfilter = strCQLfilter + "and floor=" + andar + " ";
          strCQLfilter = strCQLfilter + "and layer='" + val.title + "')" + pontoEvirgola;
           

          //------------------------------------------url PDF-----------------------------------------------------

          //------------------------------------------url DXF-----------------------------------------------------
          //var virgola = ",";
          //if (count >= data.plan_layers.length){
          //  virgola = "";
          //}

          strtypeName = strtypeName + "brMalls:vw_polygon_cql" + virgola
          strFormatOptions = strFormatOptions + loja +"."+ andar +"."+ val.title+ virgola;
          strViewParams = strViewParams + "viewparams=piso:"+ andar +";loja:"+ loja +";layer:"+ val.title + virgola;
             

          //------------------------------------------url DXF-----------------------------------------------------


          var td = document.createElement("td");
          td.setAttribute("align", "center");

          var p = document.createElement("p");
          var node = document.createTextNode(val.title.replace("_"," ").toLowerCase());
          p.appendChild(node);

          var input = document.createElement("input");
          input.setAttribute("type", "checkbox")
          input.setAttribute("id", val.title)
          input.setAttribute("value", val.title)
          input.setAttribute("onclick", "entidades.getById('"+val.title+"').show = !entidades.getById('"+val.title+"').show")
          //input.setAttribute("onclick", "alert('"+val.title+"')")
          
          //------------------------------------------------------------------------------------------------------------

          
          var layer = entidades.add(new Cesium.Entity({id:val.title}));
          var urlLayer = urlPolygon(andar, loja, val.title);
          switch (val.title) {
          
          case 'Modelo':
            //alert(urlLayer +"-"+ confg.altura+"-"+ confg.modelo+"-"+ confg.maxScale+"-"+ layer.id +"-"+val.CO_TIPO);
            desenhaLayerModelo(urlLayer, val, layer);
            break;
          
          default:
            //alert(urlLayer +"-"+ confg.extruded+"-"+ confg.altura+"-"+ confg.cor+"-"+ confg.cor_borda+"-"+ layer.id +"-"+val.CO_TIPO);
            var focus = false;
            if (val.title == "BASE"){focus = true;}
            desenhaLayer(urlLayer, val, layer, focus);
            break;
          }
          var confg = JSON.parse(val.custom_confg);

          if(validaCampo("visibilidade_inicial",confg)){
            //visibilidade_inicial = confg.visibilidade_inicial;

            if (confg.visibilidade_inicial == 'visible'){
              layer.show = true;
              input.setAttribute("checked","true");
            }else if (confg.visibilidade_inicial == 'hidden'){
              layer.show = false;
              //input.setAttribute("checked","false");
            }
          }else{
            layer.show = false;
          }
          
  

          //------------------------------------------------------------------------------------------------------------ 


          td.appendChild(p);
          td.appendChild(input);

          tr.appendChild(td);

          if (coutCol<3){
            coutCol++;
          }
          else{
            tblBody.appendChild(tr);
            tr = document.createElement("tr");
            coutCol = 1
          }

          celulas = data.plan_layers.length;
          if ( count >= celulas){
            while ((celulas%3)!=0){
              
              td = document.createElement("td");
              node = document.createTextNode(celulas);
              td.appendChild(node);
              tr.appendChild(td);

              if (coutCol<3){
                coutCol++;
              }
              else{
                tblBody.appendChild(tr);
                tr = document.createElement("tr");
                coutCol = 1
              }
              celulas++;
            }
          }

          count++;
        });
        element.appendChild(tblBody);
        element.setAttribute("border", "1");
        document.getElementById('urlDxf').value = strURLdxf + strtypeName + strFormatOptions + strViewParams;
        document.getElementById('urlPdf').value = strURLpdf + strLayersParam + strCQLfilter;
        //alert(entidades.getById("BASE"));
        //viewer.zoomTo(entidades.getById("BASE"));
        
    },
    //beforeSend: setHeaderAccept
  });
}



//==================================================================================================
//==================================================================================================
//==================================================================================================
//==================================================================================================


function pickGlobeIntersection(viewer, p0, p1) {
      //all positions are in Cartesian3
      var direction = new Cesium.Cartesian3();
      Cesium.Cartesian3.subtract(p1, p0, direction);
      alert([p1, p0]);
      Cesium.Cartesian3.normalize(direction, direction);

      var ray = new Cesium.Ray(p0, direction);
      var hitPos = viewer.scene.globe.pick(ray, viewer.scene);

      if ((hitPos !== undefined) && (hitPos !== null)) {
        return hitPos;
      } else {
        return null;
      }
}



function drawFocus(vetor, id, parentId){

  viewer.entities.add({
      id: id,
      description: propTeste(vetor),
      parent : viewer.entities.getById(parentId),
      polygon : {
          hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(vetor)),
          perPositionHeight : true,
          outline : true,
          outlineColor : Cesium.Color.RED,
          outlineWidth : 4,
          material : Cesium.Color.GREEN.withAlpha(0.5)
      }
  });

}

/*//positions : Cesium.Cartesian3.fromDegreesArrayHeights([val.geometry.coordinates[0][0],
//                                                                  val.geometry.coordinates[0][1], cAltura,
//                                                                  val.geometry.coordinates[1][0],
//                                                                  val.geometry.coordinates[1][1], cAltura]),
*/
function drawPoints(obj, height){

  for(var i = 0; i <= obj.length-1; i++){
    var pos = obj[i];
    //var height = obj._height._value;
    var ellipsoid = Cesium.Ellipsoid.WGS84;
    var cart = ellipsoid.cartesianToCartographic(pos);
    //alert(obj[i] +"\n 1)" + cart.longitude +","+cart.latitude +","+cart.height+"\n 2)" + Cesium.Math.toDegrees(cart.longitude) +","+ Cesium.Math.toDegrees(cart.latitude) +","+ Cesium.Math.toDegrees(cart.height)+"\n 3)" + pos.x +","+pos.y +","+pos.z );
    var x = Cesium.Math.toDegrees(cart.longitude);
    var y = Cesium.Math.toDegrees(cart.latitude);
    //alert(pos);
    entidades.add({
      parent : objsMedidos,
      position : Cesium.Cartesian3.fromDegrees(x, y, height),
      point : {
        pixelSize : 10,
        color : Cesium.Color.YELLOW,
        scaleByDistance: new Cesium.NearFarScalar(1.0, 2.0, 2.0, 1.0)
      }
    });

    

  }
}

function drawDistance(){
  var coords = [];
  var carts = []
  var geodesic = new Cesium.EllipsoidGeodesic();
  for (var i=0; i <= objDistancia.pontos.length-1; i++){
    var pos = objDistancia.pontos[i];
    var ellipsoid = Cesium.Ellipsoid.WGS84;
    var cart = ellipsoid.cartesianToCartographic(pos);
    var x = Cesium.Math.toDegrees(cart.longitude);
    var y = Cesium.Math.toDegrees(cart.latitude);
    coords.push(x);coords.push(y); coords.push(objDistancia.height + 1);
    carts[i] = cart;
  }

  entidades.add({
      parent : objsMedidos,
      polyline : {
          // This callback updates positions each frame.
          positions : Cesium.Cartesian3.fromDegreesArrayHeights(coords),
          width : 2,
          material : Cesium.Color.RED
      }
  });

  entidades.add({
      parent : objsMedidos,
      polyline : {
          // This callback updates positions each frame.
          positions : Cesium.Cartesian3.fromDegreesArrayHeights([coords[0],coords[1],objDistancia.height, coords[0],coords[1],objDistancia.height+1.1]),
          width : 1,
          material : Cesium.Color.RED
      }
  });

  entidades.add({
      parent : objsMedidos,
      polyline : {
          // This callback updates positions each frame.
          positions : Cesium.Cartesian3.fromDegreesArrayHeights([coords[3],coords[4],objDistancia.height, coords[3],coords[4],objDistancia.height+1.1]),
          width : 1,
          material : Cesium.Color.RED
      }
  });

  carts[0].height = objDistancia.height; 
  carts[1].height = objDistancia.height;
  var scratch = new Cesium.Cartographic();
  geodesic.setEndPoints(carts[0], carts[1]);
  //var lengthInMeters = Math.round(geodesic.surfaceDistance);
  var lengthInMeters = geodesic.surfaceDistance;
  //var distancia = (lengthInMeters / 1000).toFixed(2) + ' m';
  var distancia = lengthInMeters.toFixed(2) + ' m';
  var midpointCartographic = geodesic.interpolateUsingFraction(0.5, scratch);
  x = Cesium.Math.toDegrees(midpointCartographic.longitude);
  y = Cesium.Math.toDegrees(midpointCartographic.latitude);


  trackHome = entidades.add({
      parent : objsMedidos,
      position : Cesium.Cartesian3.fromDegrees(x,y,objDistancia.height + 1.05),
      label : {
          // This callback updates the length to print each frame.
          text: distancia,
          font : '20px sans-serif',
          fillColor : Cesium.Color.RED,
          //pixelOffset : new Cesium.Cartesian3(1.0, 0.0, 0.005)
      }
  });
  //viewer.zoomTo(trackHome);

}





function toDataURL(url, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onload = function() {
     var fileReader = new FileReader();
        fileReader.onloadend = function() {
           callback(fileReader.result);
        }
        fileReader.readAsDataURL(httpRequest.response);
  };
  httpRequest.open('GET', url);
  httpRequest.responseType = 'blob';
  httpRequest.setRequestHeader("Access-Control-Allow-Origin", "*");
  httpRequest.setRequestHeader('Access-Control-Allow-Credentials', true);
  httpRequest.setRequestHeader('Access-Control-Request-Headers','access-control-allow-credentials,access-control-allow-origin');
  httpRequest.setRequestHeader("Authorization", zippinAuthorization);
  httpRequest.send();
}


function getStoresShp(){
  var data = null;

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      alert(JSON.parse(this.responseText));
      var dados = this.responseText;
      $.each( dados.lista, function( key, val ) {
            
            var valor1 = val.lucs[0].nome
            var valor2 = val.logo.codigo
            var valor3 = val.fantasia.nome

        });
    }
  }

}