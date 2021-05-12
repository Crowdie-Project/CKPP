//LICENSE GOES HERE!

//Third Party
import Papa from 'papaparse';
const fs = require('fs').promises;

//Local
import RECCode from './RECCode';
import RECCategory from './RECCategory';
import RECSection from './RECSection';

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
    this.SectionsCSV = await (this.loadCSV('./localization/EN/code-tables/sections.csv'));
    this.CategoriesCSV = await (this.loadCSV('./localization/EN/code-tables/categories.csv'));
    this.CodesCSV = await (this.loadCSV('./localization/EN/code-tables/code-table.csv'));

    //init Sections
    this.Sections=Object.fromEntries(
    	Object.entries(this.SectionsCSV)
    	.map(([ key, val ]) => [ val.Head,
        new RECSection(
          Number(val.Head),val.Translation
          )
        ]));

    //init Categories
    this.Categories=Object.fromEntries(
    	Object.entries(this.CategoriesCSV)
    	.map(([ key, val ]) => [ val.Head,
        new RECCategory(
          Number(val.Head),val.Translation
          )
        ]));

    //init Codes
    this.Codes=Object.fromEntries(
    	Object.entries(this.CodesCSV)
    	.map(([ key, val ]) => [ val.ID, 
    		new RECCode(
    			Number(val.ID),this.getCategory(val.ID),val.Translation
    			)
    		]));

    //init Category Members
    //used to speed up queries
    this.CategoryMembers=Object.fromEntries(
    	Object.entries(this.CategoriesCSV)
    	.map(([ key, val ]) => [ val.Head, [] ]));

    var codearray = Array.from(Object.values(this.Codes), (i) => i);
    var catmatches = Array.from(Object.keys(this.Codes), (i) => this.getCategory(i).no);
  	for (var i = 0; i < catmatches.length; i++) {
  		this.CategoryMembers[String(catmatches[i])].push(codearray[i]);
  	}
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
  static listAllSections(){
  	return Array.from(Object.values(this.Sections));
  }

  /**
  *Return list of categories
  */
  static listAllCategories(){
  	return Array.from(Object.values(this.Categories));
  }

  /**
  *List all codes from a category
  */
  static listAllInCategory(code){
    return this.CategoryMembers[code] || null;
  }

  /**
  *General Purpose Function for listing codes
  *
  *Takes an options object
  *
  *options.category denotes category
  *
  *options.eventtype denotes whether "startsOnly", "endsOnly" or both will be returned
  */
  static listCodes(options){
    var target;

    if (options.category)
      target = this.listAllInCategory(options.category);
    else 
      target = this.Codes;

    if (options.eventtype == "startsOnly")
      return target.filter(code=>this.isStart(code.no));
    else if (options.eventtype == "endsOnly")
      return target.filter(code=>this.isEnd(code.no));
    else
      return target;
  }

  /**
  *Return section of code
  */
  static getSection(code){
  	return this.Sections[String(Math.floor((code%10000)/1000)*1000)];
  }

  /**
  *Return category of code
  */
  static getCategory(code){
    return this.Categories[String(Math.floor((code%10000)/100)*100)];
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
  	return this.Codes[code].no || null;
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
  	return !this.isStart(code);
  }

  /**
  *Call to reinit with different options
  */
  static async reinit(){
  	this.init();
  }

}

RECHandler.init();
