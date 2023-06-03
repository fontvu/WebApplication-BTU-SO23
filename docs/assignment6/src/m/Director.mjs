/**
 * @fileOverview  The model class Director with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @director Gerd Wagner
 * @copyright Copyright 2013-2014 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany. 
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import Person from "./Person.mjs";
import { cloneObject } from "../../lib/util.mjs";
import Movie from "./Movie.mjs";


/**
 * The class Director
 * @class
 */
class Director extends Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name, agent}) {
    super({personId, name, agent});  // invoke Person constructor
    // assign additional properties
    this._directedMovies = {};
  }
  
  get directedMovies() {
    return this._directedMovies;
  }
  
  set directedMovies(directedMovies) {
    this._directedMovies = directedMovies;
  }
  
  toString() {
    return `Director{ persID: ${this.personId}, name: ${this.name}, agent: ${this._agent}, directedMovies: ${JSON.stringify(this._directedMovies)} }`;
  }
}
/*****************************************************
 *** Class-level ("static") properties ***************
 *****************************************************/
// initially an empty collection (in the form of a map)
Director.instances = {};
// add Director to the list of Person subtypes
Person.subtypes.push( Director);

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new director record
 */
Director.add = function (slots) {
  var director = null;
  try {
    director = new Director( slots);
    director.directedMovies = {}; // Initialize directedMovies property
  } catch (e) {
    console.log(`${e.constructor.name + ": " + e.message}`);
    director = null;
  }
  if (director) {
    Director.instances[director.personId] = director;
    console.log(`Saved: ${director.name}`);
  }
};

/**
 *  Update an existing director record
 */
Director.update = function ({personId, name, directedMovies}) {
  const director = Director.instances[personId],
        objectBeforeUpdate = cloneObject( director);
  var noConstraintViolated=true, updatedProperties=[];
  try {
    if (name && director.name !== name) {
      director.name = name;
      updatedProperties.push("name");
    }
    if (directedMovies && director.directedMovies !== directedMovies) {
      director.directedMovies = directedMovies;
      updatedProperties.push("directedMovies");
    }
  } catch (e) {
    console.log( e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Director.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for director ${name}`);
    } else {
      console.log(`No property value changed for director ${name}!`);
    }
  }
};
/**
 *  Delete an existing director record
 */
Director.destroy = function (personId) {
  for (const key in Movie.instances) {
    const movie = Movie.instances[key];
    if (personId === movie.director.personId) {
      delete Movie.instances[key];
    }
  }
  const director = Director.instances[personId];
  delete Director.instances[personId];
  console.log(`Director ${director.name} deleted.`);
  Movie.syncMoviesWithLocalStorage(Movie.instances);
};
/**
 *  Retrieve all director objects as records
 */
Director.retrieveAll = function () {
  var directors = {};
  if (!localStorage["directors"]) localStorage["directors"] = "{}";
  try {
    directors = JSON.parse( localStorage["directors"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
  }
  for (const key of Object.keys( directors)) {
    try {  // convert record to (typed) object
      const director = new Director( directors[key]);
      director.directedMovies = {}; // Initialize directedMovies property
      director.directedMovies = directors[key].directedMovies; // Assign the value
      Director.instances[key] = director;
      // create superclass extension
      Person.instances[key] = Director.instances[key];
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing director ${key}: ${e.message}`);
    }
  }
  console.log(`${Object.keys( Director.instances).length} Director records loaded.`);
};

/**
 *  Save all director objects as records
 */
Director.saveAll = function () {
  try {
    localStorage["directors"] = JSON.stringify( Director.instances);
    console.log( Object.keys( Director.instances).length +" directors saved.");
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Director;
