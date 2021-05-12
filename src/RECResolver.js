//LICENSE GOES HERE!

//Third Party
import Papa from 'papaparse';
const fs = require('fs').promises;

//Local
import RECCode from './RECCode';

export default class RECHandler {
 
  //options
  static locale = "EN";

  //storage
  static SectionsCSV = {};
  static CategoriesCSV = {};
  static CodesCSV = {};
  static Categories = {};
  static Codes = {};

  static CategoryMembers = {};

  /**
  *Init RECHandler
  */
  static async init() {
  	//TODO: ADD LOCALE SELECTION
    this.locale="EN";
    this.SectionsCSV = await (this.loadCSV('./localization/EN/sections.csv'));
    this.CategoriesCSV = await (this.loadCSV('./localization/EN/categories.csv'));
    this.CodesCSV = await (this.loadCSV('./localization/EN/code-table.csv'));

    //init Sections
    this.Sections=Object.fromEntries(
    	Object.entries(this.SectionsCSV)
    	.map(([ key, val ]) => [ val.Head, val.Translation ]));

    //init Categories
    this.Categories=Object.fromEntries(
    	Object.entries(this.CategoriesCSV)
    	.map(([ key, val ]) => [ val.Head, val.Translation ]));

    //init Codes
    this.Codes=Object.fromEntries(
    	Object.entries(this.CodesCSV)
    	.map(([ key, val ]) => [ val.ID, 
    		new RECCode(
    			Number(val.ID),this.getCategory(val.ID),val.Translation
    			)
    		]));

    //init Category Members
    this.CategoryMembers=Object.fromEntries(
    	Object.entries(this.CategoriesCSV)
    	.map(([ key, val ]) => [ val.Head, [] ]));

    var codearray = Array.from(Object.keys(this.Codes), (i) => i);
    var catmatches = Array.from(Object.keys(this.Codes), (i) => this.getCategory(i));
	for (var i = 0; i < catmatches.length; i++) {
		this.CategoryMembers[String(catmatches[i])].push(codearray[i]);
	}

    //console.log(this.Codes);
    //console.log(this.CategoryMembers);
    //console.log(this.getAllInCat(1300));
  }

  /**
  *Read from csv
  */
  static async loadCSV(filename){

  	const CSVconfig = {header: true};

	let { data: CSV, error } = await fs.readFile(filename, 'utf-8')
	.then(csv => Papa.parse(csv,CSVconfig));
    if (error) console.log("error", error);
    else{
      return CSV;
    }
  }

  /**
  *Return list of sections
  */
  static listSections(){
  	return Array.from(Object.keys(this.Sections));
  }

  /**
  *Return list of categories
  */
  static listCategories(){
  	return Array.from(Object.keys(this.Categories));
  }

  /**
  *Return section of code
  */
  static getSection(code){
  	return Math.floor((code%10000)/1000)*1000;
  }

  /**
  *Return category of code
  */
  static getCategory(code){
  	return Math.floor((code%10000)/100)*100;
  }

  /**
  *Return code info
  */
  static getCode(code){
  	return this.Codes[code] || null;
  }

  /**
  *Return name of code
  */
  static getName(code){
  	return this.Codes[code].code || null;
  }

  /**
  *List all codes from a category
  */
  static getAllInCat(code){
  	return this.CategoryMembers[code] || null;
  }

  /**
  *Return whether code is start code
  */
  static isStart(code){
  	return code < 10000;
  }

  /**
  *Return whether code is end code
  */
  static isEnd(code){
  	return code >= 10000;
  }

  /**
  *TODO: FILTERING
  */

  /**
  *Call to reinit with different options
  */
  static async reinit(){
  	this.init();
  }

}

RECHandler.init();
