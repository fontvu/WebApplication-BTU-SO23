/**
 * @fileOverview  The model class Movie with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { cloneObject, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { ConstraintViolation, FrozenValueConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation} from "../../lib/errorTypes.mjs";
import { Enumeration } from "../../lib/Enumeration.mjs";
import Person from "./Person.mjs";
import Director from "./Director.mjs";
import Actor from "./Actor.mjs";
/**
 * Enumeration type
 * @global
 */
const MovieCategoryEL = new Enumeration(["Tvseriesepisode","Biography"]);
/**
 * Constructor function for the class Movie 
 * including the incomplete disjoint segmentation {TextMovie, Biography}
 * @class
 */
class Movie {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({movieID, title, releaseDate, director, actor, category, tvSeriesName, episodeNo, about}) {
    this.movieID = movieID;
    this.title = title;
    this.releaseDate = releaseDate;
    this.director = director;
    this.actor = actor;
    // optional properties
    if (category) this.category = category;  // from MovieCategoryEL
    if (tvSeriesName) this.tvSeriesName = tvSeriesName;
    if (episodeNo) this.episodeNo = episodeNo;
    if (about) this.about = about;
  }
  get movieID() {
    return this._movieID;
  }
  static checkMovieID( movieID) {
    if (!movieID) return new NoConstraintViolation();
    else if (typeof movieID !== "string" || movieID.trim() === "") {
      return new RangeConstraintViolation(
        "The Movie ID must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkMovieIDAsId( movieID) {
    var validationResult = Movie.checkMovieID( movieID);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!movieID) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the Movie ID must be provided!");
      } else if (movieID in Movie.instances) {
        validationResult = new UniquenessConstraintViolation(
            "There is already a movie record with this Movie ID!");
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set movieID( movieID) {
    const validationResult = Movie.checkMovieIDAsId( movieID);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieID = movieID;
    } else {
      throw validationResult;
    }
  }
  get title() {return this._title;}
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
  get releaseDate() {return this._releaseDate;}
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
      y = new Date(y);
      if (typeof y.getMonth !== "function"){
        return new MandatoryValueConstraintViolation("A release date is invalid");
      }
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
    if (!p) {
      if (this._director) {
        delete this._director.directedMovies[this._movieID];
        this._director = undefined;
      }
    } else {
      if (Array.isArray(p)) p = p[0];
      const director_id = (typeof p !== "object") ? p : p.personId;
      if (this._director) {
        delete this._director.directedMovies[this._movieID];
      }
      this._director = Director.instances[director_id];
      this._director.directedMovies[this._movieID] = this._movieID;
      console.log(this._director);
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
      // add the new actor reference
      this._actor[person_id] = Actor.instances[person_id];
      // add the movie reference to the actor
      this._actor[person_id].actedInMovies[this._movieID] = this.movieID;
    }
  }
  removePerson(a) {
    // a can be an ID reference or an object reference
    const person_id = (typeof a !== "object") ? parseInt(a) : a.personId;
    if (person_id) {
      // automatically delte the movie reference from the actor
      delete this._actor[person_id].actedInMovies[this._movieID];
      // delete the person reference
      delete this._actor[String(person_id)];
    }
  }
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
  get category() {return this._category;}
  static checkCategory( c) {
    if (c === undefined) {
      return new NoConstraintViolation();  // category is optional
    } else if (!isIntegerOrIntegerString( c) || parseInt( c) < 1 ||
        parseInt( c) > MovieCategoryEL.MAX) {
      return new RangeConstraintViolation(
          `Invalid value for category: ${c}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  set category( c) {
    var validationResult = null;
    if (this.category) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation(
          "The category cannot be changed!");
    } else {
      validationResult = Movie.checkCategory( c);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseInt( c);
    } else {
      throw validationResult;
    }
  }
  get tvSeriesName() {return this._tvSeriesName;}
  static checkTvSeriesName(t) {
    if (!t) {
      return new MandatoryValueConstraintViolation("A tvSeriesName must be provided!");
    } else if (typeof t !== "string" || t.trim() === "") {
      return new RangeConstraintViolation("The tvSeriesName must be a non-empty string!");
    }
    else {
      return new NoConstraintViolation();
    }
  }
  set tvSeriesName(t) {
    var validationResult = Movie.checkTvSeriesName(t);
    if (validationResult instanceof NoConstraintViolation) {
      this._tvSeriesName = t;
    } else {
      throw validationResult;
    }
  }
  get episodeNo() {return this._episodeNo;}
  static checkEpisodeNo( sA, c) {
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !sA) {
      return new MandatoryValueConstraintViolation(
          "An episode number must be provided for a textmovie!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && sA) {
      return new ConstraintViolation("An episode number must not " +
          "be provided if the movie is not a TV series!");
    }
    // check if the episode number is a positive integer
    else if (sA && (!isIntegerOrIntegerString( sA) || parseInt( sA) < 1)) {
      return new RangeConstraintViolation(
          "The episode number must be a positive integer!")
    } else {
      return new NoConstraintViolation();
    }
  }
  set episodeNo( v) {
    const validationResult = Movie.checkEpisodeNo( v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._episodeNo = v;
    } else {
      throw validationResult;
    }
  }
  get about() {return this._about;}
  static checkAbout( a, c) {
    const cat = parseInt( c);
    //??? if (!cat) cat = MovieCategoryEL.BIOGRAPHY;
    if (cat === MovieCategoryEL.BIOGRAPHY && !a) {
      return new MandatoryValueConstraintViolation(
          "A biography movie record must have an 'about' field!");
    } else if (cat !== MovieCategoryEL.BIOGRAPHY && a) {
      return new ConstraintViolation("An 'about' field value must not " +
          "be provided if the movie is not a biography!");
    } else if (a && (typeof(a) !== "string" || a.trim() === "")) {
      return new RangeConstraintViolation(
          "The 'about' field value must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set about( v) {
    const validationResult = Movie.checkAbout( v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._about = v;
    } else {
      throw validationResult;
    }
  }
  /*********************************************************
   ***  Other Instance-Level Methods  ***********************
   **********************************************************/
  toString() {
    var movieStr = `Movie{ Movie ID: ${this.movieID}, title: ${this.title}, releaseDate: ${this.releaseDate}, director: ${this.director}, actor: ${this.actor}`;
    switch (this.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        movieStr += `, textmovie subject area: ${this.episodeNo}`;
        break;
      case MovieCategoryEL.BIOGRAPHY:
        movieStr += `, biography about: ${this.about}`;
        break;
    }
    return movieStr + "}";
  }
  /* Convert object to record */
  toJSON() { // is invoked by JSON.stringify in Movie.saveAll
    const rec = {};
    for (const p of Object.keys( this)) {
      // remove underscore prefix
      if (p.charAt(0) === "_") rec[p.substr(1)] = this[p];
    }
    return rec;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};

/************************************************
*** Class-level ("static") methods **************
*************************************************/
/**
 * Create a new Movie record
 * @method 
 * @static
 * @param {{movieID: string, title: string, releaseDate: number, director: Director, actor: Actor, category: ?number, episodeNo: ?string, about: ?string}} slots - A record of parameters.
 */
Movie.add = function (slots) {
  var movie = null;
  try {
    movie = new Movie( slots);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    movie = null;
  }
  if (movie) {
    Movie.instances[movie.movieID] = movie;
    console.log(`${movie.toString()} created!`);
  }
};
/**
 * Update an existing Movie record
 * where the slots argument contains the slots to be updated and performing 
 * the updates with setters makes sure that the new values are validated
 * @method 
 * @static
 * @param {{movieID: string, title: string, releaseDate: number, category: ?number, episodeNo: ?string, about: ?string}} slots - A record of parameters.
 */
Movie.update = function ({movieID, title, releaseDate, director, actor, category, episodeNo, about}) {
  const movie = Movie.instances[movieID],
        objectBeforeUpdate = cloneObject( movie);
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
    if (director && movie.director !== director) {
      movie.director = director;
      updatedProperties.push("director");
    }
    if (actor && movie.actor !== actor) {
      movie.actor = actor;
      updatedProperties.push("actor");
    }
    if (category) {
      if (movie.category === undefined) {
        movie.category = category;
        updatedProperties.push("category");
      } else if (category !== movie.category) {
        throw new FrozenValueConstraintViolation(
            "The movie category must not be changed!");
      }
    } else if (category === "" && "category" in movie) {
      throw new FrozenValueConstraintViolation(
          "The movie category must not be unset!");
    }
    if (episodeNo && movie.episodeNo !== episodeNo) {
      movie.episodeNo = episodeNo;
      updatedProperties.push("episodeNo");
    }
    if (about && movie.about !== about) {
      movie.about = about;
      updatedProperties.push("about");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its previous state (before updating)
    Movie.instances[movieID] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieID}`);
    } else {
      console.log(`No property value changed for movie ${movie.toString()}!`);
    }
  }
};
/**
 * Delete an existing Movie record
 * @method 
 * @static
 * @param {string} movieID - The Movie ID of a movie.
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
 * Load all movie table records and convert them to objects
 * Precondition: publishers and people must be loaded first
 * @method 
 * @static
 */
Movie.retrieveAll = function () {
  var movies={};
  try {
    if (!localStorage["movies"]) localStorage.setItem("movies", "{}");
    else {
      movies = JSON.parse(localStorage.getItem("movies"));
      console.log(`${Object.keys(movies).length} movie records loaded.`);
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  for (const movieID of Object.keys( movies)) {
    Movie.instances[movieID] = Movie.convertRec2Obj( movies[movieID]);
  }
};
/**
 * Convert movie record to movie object
 * @method 
 * @static
 * @param {{movieID: string, title: string, releaseDate: number, category: ?number, episodeNo: ?string, about: ?string}} slots - A record of parameters.
 * @returns {object}
 */
Movie.convertRec2Obj = function (movieRow) {
  var movie=null;
  try {
    movie = new Movie( movieRow);
  } catch (e) {
    console.log(`${e.constructor.name} while deserializing a movie record: ${e.message}`);
  }
  return movie;
};
/**
 * Save all Movie objects as records
 * @method 
 * @static
 */
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  console.log("Movie.instances:", Movie.instances); // Add this line to check the Movie instances
  try {
    localStorage["movies"] = JSON.stringify( Movie.instances);
    console.log(`${nmrOfMovies} movie records saved.`);
    console.log(JSON.stringify( Movie.instances));
  } catch (e) {
    console.log(e)
    alert("Error when writing to Local Storage\n" + e);
  }
};

Movie.syncMoviesWithLocalStorage = function (movies) {
  localStorage.setItem("movies", JSON.stringify(movies))
  console.log(localStorage.getItem("movies"));
};

export default Movie;
export { MovieCategoryEL };
