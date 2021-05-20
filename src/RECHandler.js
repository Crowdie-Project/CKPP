//LICENSE GOES HERE!

//Third Party
import Papa from 'papaparse';
const fs = require('fs').promises;

//Local
import RECCode from './RECCode';
import RECCategory from './RECCategory';
import RECSection from './RECSection';

export default class RECHandler {

  /**
  *Init RECHandler
  */

  constructor() {
    //TODO: ADD SUPPORT FOR LOCALE CUSTOMIZATOIN

    //options
    this.locale = "EN";

    //storage
    this.SectionsCSV = {};
    this.CategoriesCSV = {};
    this.CodesCSV = {};
    this.Categories = {};
    this.Codes = {};

    this.CategoryMembers = {};

    //Used to cache load configuration
    //Consider overriding if weird behavior is encountered
    this.loaded = false;
  }

  /**
  *Load asynchronously !
  */
  async ready(callback){

    //TODO: ADD SUPPORT FOR LOCALE CUSTOMIZATOIN
    //TODO: FIX CACHING FOR loadCSV's!

    //Cache if this.loaded!
    if(this.loaded==false){

    try {
      //TODO: ADD OPTIONAL CALLBACKS?
      //TODO: FIX PATHS so they can be better tested?

      this.SectionsCSV = await this.loadCSV_fs('../localization/EN/code-tables/sections.csv');
      this.CategoriesCSV = await this.loadCSV_fs('../localization/EN/code-tables/categories.csv');
      this.CodesCSV = await this.loadCSV_fs('../localization/EN/code-tables/code-table.csv');

      this.initProps(callback);
    } catch (e) {
    console.error(e);
    }}

    else{
      callback.bind(this)();
    }
    
  }

  /**
  *Load sync!
  */
  init(){

    //NOTE: this.loaded is ignored so that init()
    //can be called for reinitializations

    //TODO: ADD SUPPORT FOR LOCALE CUSTOMIZATOIN
    //TODO: Add alternatives besides csv-loader for webpack


    //Cache if this.loaded!
    //if(this.loaded==false){

    try {
      //TODO: FIX PATHS so they can be better tested?

    this.SectionsCSV = this.loadCSV_webpack('../localization/EN/code-tables/sections.csv');
    this.CategoriesCSV = this.loadCSV_webpack('../localization/EN/code-tables/categories.csv');
    this.CodesCSV = this.loadCSV_webpack('../localization/EN/code-tables/code-table.csv');

      this.initProps(() => void 0);
    } catch (e) {
    console.error(e);
    }

    //}

    /*else{
      callback.bind(this)();
      console.log("Already Loaded");
    }*/

  }

  /**
  *Read from csv using fs
  */
  async loadCSV_fs(filename){

    //TODO FIX THIS?

    const CSVconfig = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    };
    let { data: CSV, error } = await fs.readFile(filename, 'utf-8')
    .then(csv => Papa.parse(csv,CSVconfig));
    if (error) console.log("error", error);
    else{
      return CSV;
    }

    /*const CSVconfig = {header: true,
      complete: ...,
      error: ...
    };*/

    //const CSVconfig = {header: true};

    /*try {
      fs.readFile(filename, 'utf-8', function(err,data){
        console.log(data);
      });
      let csv = await Papa.parse(data,CSVconfig);
      return csv;
    } catch(e) {
      console.error(e);
    }*/

    /*let { data: CSV, error } = await fs.readFile(filename, 'utf-8')
    .then(csv => Papa.parse(csv,CSVconfig);
      return CSV;*/

    /*let { data: CSV, error } = await fs.readFile(filename, 'utf-8')
    .then(csv => Papa.parse(csv,CSVconfig));
    if (error) console.log("error", error);
    else{
      return CSV;
    }*/

    //let data = fs.readFileSync(filename, 'utf-8');
  }

  /**
  *Read from csv using the `csv-loader` webpack loader
  */
  loadCSV_webpack(filename){
    let target = '!!csv-loader!'+(filename)
    //console.log(target);
    return require(target);
  }

  //Initialize remaining properties
  initProps(callback){

    //console.log("HI!");

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

    this.loaded = true;
    callback.bind(this)();

  }

  /**
  *Return list of sections
  */
  listAllSections(){
  	return Array.from(Object.values(this.Sections));
  }

  /**
  *Return list of categories
  */
  listAllCategories(){
  	return Array.from(Object.values(this.Categories));
  }

  /**
  *List all codes from a category
  */
  listAllInCategory(code){
    return this.CategoryMembers[code] || null;
  }

  /**
  *General Purpose for listing codes
  *
  *Takes an options object
  *
  *options.category denotes category
  *
  *options.eventtype denotes whether "startsOnly", "endsOnly" or both will be returned
  */
  listCodes(options={}){
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
  getSection(code){
  	return this.Sections[String(Math.floor((code%10000)/1000)*1000)];
  }

  /**
  *Return category of code
  */
  getCategory(code){
    return this.Categories[String(Math.floor((code%10000)/100)*100)];
  }

  /**
  *Return code info
  */
  getCode(code){
  	return this.Codes[code] || null;
  }

  /**
  *Return name of code
  */
  getName(code){
  	return this.Codes[code].no || null;
  }

  /**
  *Return whether code is start code
  */
  isStart(code){
  	return code < 10000;
  }

  /**
  *Return whether code is end code
  */
  isEnd(code){
  	return !this.isStart(code);
  }

}
