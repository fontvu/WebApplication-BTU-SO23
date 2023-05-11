/**
 * @fileOverview  The model class Movie with attribute definitions, (class-level)
 *                check methods, setter methods, and the special methods saveAll
 *                and retrieveAll
 * @person Gerd Wagner
 */
import Person from "./Person.mjs";
import { cloneObject } from "../../lib/util.mjs";
import {
  NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation, IntervalConstraintViolation
}
  from "../../lib/errorTypes.mjs";

/**
 * The class Movie
 * @class
 */
class Movie {
  // using a record parameter with ES6 function parameter destructuring
  constructor({ movieID, title, releaseDate, director, directorIdRefs, actor, actorIdRefs }) {
    this.movieID = movieID;
    this.title = title;
    this.releaseDate = releaseDate;
    // assign object references or ID references (to be converted in setter)
    this.director = director || directorIdRefs;
    this.actor = actor || actorIdRefs;
  }
  get movieID() {
    return this._movieID;
  }
  static checkMovieID(movieID) {
    if (!movieID) return new NoConstraintViolation();
    else if (typeof movieID !== "string" || movieID.trim() === "") {
      return new RangeConstraintViolation(
        "The Movie ID must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkMovieIDAsId(movieID) {
    var validationResult = Movie.checkMovieID(movieID);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!movieID) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the Movie ID must be provided!");
      } else if (Movie.instances[movieID]) {
        validationResult = new UniquenessConstraintViolation(
          `There is already a movie record with Movie ID ${movieID}`);
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set movieID(n) {
    const validationResult = Movie.checkMovieIDAsId(n);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieID = n;
    } else {
      throw validationResult;
    }
  }
  get title() {
    return this._title;
  }
  static checkTitle(t) {
    if (!t) {
      return new MandatoryValueConstraintViolation("A title must be provided!");
    } else if (typeof t !== "string" || t.trim() === "") {
      return new RangeConstraintViolation("The title must be a non-empty string!");
    } else if (!(/^(?=.{0,120}$).*$/.test(t))) {
      return new PatternConstraintViolation(
        'The Title must be fewer 120 characters long!');
    }
    else {
      return new NoConstraintViolation();
    }
  }
  set title(t) {
    var validationResult = Movie.checkTitle(t);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = t;
    } else {
      throw validationResult;
    }
  }
  get releaseDate() {
    return this._releaseDate;
  }
  set releaseDate(y) {
    const validationResult = Movie.checkReleaseDate(y);
    if (validationResult instanceof NoConstraintViolation) {
      this._releaseDate = new Date(y);
    } else {
      throw validationResult;
    }
  }

  static checkReleaseDate(y) {
    const YEAR_FIRST_MOVIE = new Date(1895, 12, 28);
    if (!y) {
      return new MandatoryValueConstraintViolation(
        "A release date must be provided!");
    } else {
      if (typeof y.getMonth === "function");
      if (y < YEAR_FIRST_MOVIE) {
        return new IntervalConstraintViolation(
          `The release date must be after ${YEAR_FIRST_MOVIE}!`);
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  get director() {
    return this._director;
  }
  static checkDirector(director_id) {
    var validationResult = null;
    if (!director_id) {
      validationResult = new NoConstraintViolation();  // optional
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef(director_id);
    }
    return validationResult;
  }
  set director(p) {
    if (!p) {  // unset director
      delete this._director;
    } else {
      // p can be an ID reference or an object reference
      if (Array.isArray(p)) p = p[0];
      const director_id = (typeof p !== "object") ? p : p.personId;
      const validationResult = Movie.checkDirector(director_id);
      if (validationResult instanceof NoConstraintViolation) {
        // create the new actor reference
        this._director = Person.instances[director_id];
      } else {
        throw validationResult;
      }
    }
  }
  get actor() {
    return this._actor;
  }
  static checkActor(person_id) {
    var validationResult = null;
    if (!person_id) {
      // person(s) are optional
      validationResult = new NoConstraintViolation();
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef(person_id);
    }
    return validationResult;
  }
  addPerson(a) {
    // a can be an ID reference or an object reference
    const person_id = (typeof a !== "object") ? parseInt(a) : a.personId;
    if (person_id) {
      const validationResult = Movie.checkActor(person_id);
      if (person_id && validationResult instanceof NoConstraintViolation) {
        // add the new person reference
        const key = String(person_id);
        this._actor[key] = Person.instances[key];
      } else {
        throw validationResult;
      }
    }
  }
  removePerson(a) {
    // a can be an ID reference or an object reference
    const person_id = (typeof a !== "object") ? parseInt(a) : a.personId;
    if (person_id) {
      const validationResult = Movie.checkActor(person_id);
      if (validationResult instanceof NoConstraintViolation) {
        // delete the person reference
        delete this._actor[String(person_id)];
      } else {
        throw validationResult;
      }
    }
  }
  /**
   * @param {Array<Person> | {[key: string]: Person}} a
   */
  set actor(a) {
    this._actor = {};
    if (Array.isArray(a)) {  // array of IdRefs
      for (const idRef of a) {
        this.addPerson(idRef);
      }
    } else {  // map of IdRefs to object references
      for (const idRef of Object.keys(a)) {
        this.addPerson(a[idRef]);
      }
    }
  }
  // Serialize movie object
  toString() {
    var movieStr = `Movie{ Movie ID: ${this.movieID}, title: ${this.title}, releaseDate: ${this.releaseDate}`;
    if (this.director) movieStr += `, director: ${this.director.personId}`;
    if (this.actor) movieStr += `, actors: ${Object.keys(this.actor).join(', ')}`;
    return `${movieStr}`;
  }  
  // Convert object to record with ID references
  toJSON() {  // is invoked by JSON.stringify in Movie.saveAll
    var rec = {};
    for (const p of Object.keys(this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_director":
          // convert object reference to ID reference
          if (this._director) rec.director = this._director.personId;
          break;
          case "_actor":
            // convert the list of object references to a list of ID references
            rec.actor = [];
            for (const person of Object.keys(this._actor)) {
              rec.actor.push(parseInt(person));
            }
            break;          
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};

/********************************************************
*** Class-level ("static") storage management methods ***
*********************************************************/
/**
 *  Create a new movie record/object
 */
Movie.add = function (slots) {
  try {
    console.log("Movie.add", slots);
    const movie = new Movie(slots);
    Movie.instances[movie.movieID] = movie;
    console.log(`Movie record ${JSON.stringify(movie)} created!`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 *  Update an existing Movie record/object
 */
Movie.update = function ({ movieID, title, releaseDate,director_id ,actorIdRefsToAdd, actorIdRefsToRemove}) {
  const movie = Movie.instances[movieID],
    objectBeforeUpdate = cloneObject(movie);
  var noConstraintViolated = true, updatedProperties = [];
  try {
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (releaseDate && movie.releaseDate !== releaseDate) {
      movie.releaseDate = releaseDate;
      updatedProperties.push("releaseDate");
    }
    if (actorIdRefsToAdd) {
      updatedProperties.push("persons(added)");
      for (const personIdRef of actorIdRefsToAdd) {
        movie.addPerson(personIdRef);
      }
    }
    if (actorIdRefsToRemove) {
      updatedProperties.push("persons(removed)");
      for (const person_id of actorIdRefsToRemove) {
        movie.removePerson(person_id);
      }
    }
    // director_id may be the empty string for unsetting the optional property
    if (director_id && (!movie.director && director_id ||
      movie.director && movie.director.name !== director_id)) {
      movie.director = director_id;
      updatedProperties.push("director");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Movie.instances[movieID] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieID}`);
    } else {
      console.log(`No property value changed for movie ${movie.movieID}!`);
    }
  }
};
/**
 *  Delete an existing Movie record/object
 */
Movie.destroy = function (movieID) {
  if (Movie.instances[movieID]) {
    console.log(`${Movie.instances[movieID].toString()} deleted!`);
    delete Movie.instances[movieID];
  } else {
    console.log(`There is no movie with Movie ID ${movieID} in the database!`);
  }
};
/**
 *  Load all movie table rows and convert them to objects 
 *  Precondition: actors and people must be loaded first
 */
Movie.retrieveAll = function () {
  var movies = {};
  try {
    if (!localStorage["movies"]) localStorage["movies"] = "{}";
    else {
      movies = JSON.parse(localStorage["movies"]);
      console.log(`${Object.keys(movies).length} movie records loaded.`);
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  for (const movieID of Object.keys(movies)) {
    try {
      Movie.instances[movieID] = new Movie(movies[movieID]);
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing movie ${movieID}: ${e.message}`);
    }
  }
};
/**
 *  Save all movie objects
 */
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys(Movie.instances).length;
  console.log("Movie.instances:", Movie.instances); // Add this line
  try {
    localStorage["movies"] = JSON.stringify(Movie.instances);
    console.log(`${nmrOfMovies} movie records saved.`);
  } catch (e) {
    console.error("Error when writing to Local Storage:", e); // Modify this line
  }
};

export default Movie;
