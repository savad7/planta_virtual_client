


//http://localhost:6080/geoserver/brMalls/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=brMalls%3Avw_objects_layer&maxFeatures=50&outputFormat=application%2Fjson

var servidor = 'localhost:6080';
http://localhost:3000/layer_list/


function desenhaLayer(strUrl, objLayer, objPai, foco){
   var confgLayer = JSON.parse(objLayer.CUSTOM_CONFG);



   var xmlhttp = new XMLHttpRequest();

  	xmlhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	      //alert(JSON.parse(this.responseText));
	      var data = this.responseText;
	      $.each( data.features, function( key, val ) {
	        var idObj = val.properties.id;
	        var confg = JSON.parse(val.properties.custom_confg);
	        
	        coord = val.geometry.coordinates[0];
	               

	        var nuExtruded = 0;
	        var nuAltura = 0;
	        var cor = "#FFFFFF";
	        var alpha = 1;
	        //var visibilidade_inicial = 'hidden';
	       
	       
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
	              outlineColor : Cesium.Color.fromCssColorString(confgLayer.cor_borda),
	              outlineWidth : 1,
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
	    
	  	};  
	}
	xmlhttp.open("GET", strUrl, true);
  	xmlhttp.send();
}


function urlPolygon(floor, plan, layer){
  //return 'http://'+ servidor +'/geoserver/mapa_loja/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_mapa_loja:vw_planta_polygon&outputFormat=application%2Fjson&viewparams=piso:'+piso+';loja:'+loja +';layer:'+ layer; //Geoserver URL  
  return 'http://'+ servidor +'/geoserver/brMalls/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=brMalls:vw_objects_layer&outputFormat=application%2Fjson&viewparams=floor:'+floor+';plan:'+plan +';layer:'+ layer; //Geoserver URL  
  //return 'https://'+ servidorInteg +'/geoPlantas/layers/v1.0.0/polygon/'+loja+'/'+piso+'/'+layer
}

function urlLinestring(floor, plan, layer){
  //return 'http://'+ servidor +'/geoserver/mapa_loja/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_mapa_loja:vw_planta_linestring&outputFormat=application%2Fjson&viewparams=piso:'+piso+';loja:'+loja +';layer:'+ layer; //Geoserver URL  
  return 'http://'+ servidor +'/geoserver/brMalls/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=brMalls:vw_objects_layer&outputFormat=application%2Fjson&viewparams=floor:'+pifloorso+';plan:'+plan +';layer:'+ layer; //Geoserver URL  
  //return 'https://'+ servidorInteg +'/geoPlantas/layers/v1.0.0/linestring/'+loja+'/'+piso+'/'+layer
}

function getLayers(andar, loja){

	var xmlhttp = new XMLHttpRequest();

  	xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      //alert(JSON.parse(this.responseText));
      var data = this.responseText;
      $.each( data.plan_layers, function( key, val ) {
            
            var layer = entidades.add(new Cesium.Entity({id:val.title}));
          var urlLayer = urlPolygon(andar, loja, val.title);
          switch (val.layer_type) {
          case 'Gondola':
            
            desenhaGondola(urlLayer, val, layer, false);
            break;
          case 'Shelf':
            
            desenhaShelf(urlLayer, val, layer, false);
            break;
          case 'Modelo':
            
            desenhaLayerModelo(urlLayer, val, layer);
            break;
          case 'Cano':
            
            urlLayer = urlLinestring(andar, loja, val.title);
            desenhaLayerCano(urlLayer, val, layer);
            break;
          case '3dCam':
            
            desenha3DCam(urlLayer, val, layer);
            break;
          default:
            
            var focus = false;
            if (val.title == "BASE"){focus = true;}
            desenhaLayer(urlLayer, val, layer, focus);
            break;
          }
          var confg = JSON.parse(val.CUSTOM_CONFG);
          if (confg.visibilidade_inicial == 'visible'){
            layer.show = true;
            input.setAttribute("checked","true");
          }else if (confg.visibilidade_inicial == 'hidden'){
            layer.show = false;
            //input.setAttribute("checked","false");
          }
        });
    }
  };
  xmlhttp.open("GET", urlLojas, true);
  //xmlhttp.setRequestHeader("Authorization", "Bearer " + token);
  //xmlhttp.setRequestHeader('Access-Control-Allow-Credentials', true);
  //xmlhttp.setRequestHeader('Access-Control-Allow-Headers','Accept')
  //xmlhttp.setRequestHeader('Accept', 'application/json');
  //xmlhttp.setRequestHeader('Access-Control-Allow-Origin', 'http://rdlabs-app:6080');
  //xmlhttp.onreadystatechange = handler;
  xmlhttp.send();

}