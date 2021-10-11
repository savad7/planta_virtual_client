
var listaFiltrada = function(vector){
  	vector.filter(function (nombres, indice) {
      		return vector.indexOf(nombres) === indice;
    	})
  	vector.sort(function (a, b) {
      		if (a < b) return -1;
      		else if (a > b) return 1;
      		return 0;
    	});
	console.log(vector);
	};


var class1 = ['yasmin', 'isadora', 'benedita', 'brenda', 'luiza', 'fatima', 'caio', 'teresinha', 'hugo', 'zeca', 'catarina', 'emanuel', 'marcelo', 'claudio', 'marina', 'isabela', 'anthony', 'rebeca', 'filipe', 'laís', 'vinicius', 'helena', 'elisa', 'rodrigo', 'geraldo', 'yuri', 'marcio']

var class2  =  [ 'benedita' ,  'elisa' ,  'emanuel' ,  'rodrigo' ,  'filipe' ,  'marcio' ,  'teresinha' ,  'laís' ,  'vinicius' ,  'marina' ,  'catarina' ,  'luiza ' ,  ' marcelo ' ,  ' rebeca ' ,  ' hugo ' ,  ' geraldo ' ,  ' zeca ' ,  ' caio ' ,  ' anthony ' ,  ' yasmin ',  'claudio' ]

var class3  =  [ 'isadora' ,  'isabela' ,  'laís' ,  'claudio' ,  'catarina' ,  'zeca' ,  'teresinha' ,  'emanuel' ,  'marcio' ,  'fatima' ,  'rodrigo' ,  'luiza ' ,  ' brenda ' ,  ' marina ' ,  ' marcelo ' ,  ' benedita ' ,  ' rebeca ' ,  ' filipe ' ,  ' helena ' ,  'elisa ' ,  ' hugo ' ,  ' geraldo ' ]


listaFiltrada(class1);
listaFiltrada(class2);
listaFiltrada(class3);

===================================================================================





var numeroDeVeces = function(lista, nombre, aPartirDe){

    var num = lista.indexOf(nombre,aPartirDe);

    if (num===-1){
        return 0;
    }
	var retorno = 1 + numeroDeVeces(lista, nombre, num+1);
    return retorno;
}


var a= ['yasmin', 'isadora', 'benedita', 'brenda', 'luiza', 'fatima', 'caio', 'teresinha', 'hugo', 'zeca', 'catarina', 'emanuel', 'marcelo', 'claudio', 'marina', 'isabela', 'anthony', 'rebeca', 'filipe', 'laís', 'vinicius', 'helena', 'elisa', 'rodrigo', 'geraldo', 'yuri', 'marcio']
let b = ['benedita', 'elisa', 'emanuel', 'rodrigo', 'filipe', 'marcio', 'teresinha', 'laís', 'vinicius', 'marina', 'catarina', 'luiza', 'marcelo', 'rebeca', 'hugo', 'geraldo', 'zeca', 'caio', 'anthony', 'yasmin', 'claudio']
let c = ['isadora', 'isabela', 'laís', 'claudio', 'catarina', 'zeca', 'teresinha', 'emanuel', 'marcio', 'fatima', 'rodrigo', 'luiza', 'brenda', 'marina', 'marcelo', 'benedita', 'rebeca', 'filipe', 'helena', 'elisa', 'hugo', 'geraldo']

var nombres = a.concat(b,c);

var busca = 'marcelo';

console.log("falta de "+busca+": " + (3 - numeroDeVeces(nombres, busca, 0)));