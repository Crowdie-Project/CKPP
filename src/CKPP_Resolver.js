//LICENSE GOES HERE!

import Papa from 'papaparse';
const fs = require('fs').promises;

export default class CKPP_Resolver {

  /*
  //read from csv
  */
  static async loadCSV(filename){

	let { data: CSV, error } = await fs.readFile(filename, 'utf-8')
	.then(csv => Papa.parse(csv));
	//.then(obj => console.log(obj));
    if (error) console.log("error", error);
    else{
      return CSV;
    }
  }

  //init to load csv and categories
  static async init() {
  	//TODO: ADD LOCALE SELECTION
    //static locale="EN";
    //const Categories = await (CKPP_Resolver.loadCSV('./localization/EN/categories.csv'));
    //const Codes = await (CKPP_Resolver.loadCSV('./localization/EN/code-table.csv'));
    //console.log(Categories);
    //console.log(Codes);
  }

//return name

//list category

//return start of finish or finish of start

  //Call to reinit with different options
  static async reinit(){
  	CKPP_Resolver.init();
  }

}

CKPP_Resolver.init();
