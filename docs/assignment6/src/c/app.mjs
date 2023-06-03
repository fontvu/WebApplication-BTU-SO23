/**
 * @fileOverview  App-level controller code
 * @author Gerd Wagner
 */
import Person from "../m/Person.mjs";
import Actor from "../m/Actor.mjs";
import Director from "../m/Director.mjs";
import Movie, { MovieCategoryEL } from "../m/Movie.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
  try {
    Person.instances["14"] = new Person({
      personId: 14,
      name: "John Forbes Nash"
    });
    Person.instances["15"] = new Person({
      personId: 15,
      name: "John Doe"
    });
    Person.instances["16"] = new Person({
      personId: 16,
      name: "Jane Doe"
    });
    Person.saveAll();
    Director.instances["1"] = new Director({
      personId: 1,
      name: "Stephen Frears"
    });
    Director.instances["2"] = new Director({
      personId: 2,
      name: "George Lucas"
    });
    Director.instances["3"] = new Director({
      personId: 3,
      name: "Quentin Tarantino"
    });
    Director.instances["9"] = new Director({
      personId: 9,
      name: "Russell Crowe"
    });
    Director.instances["13"] = new Director({
      personId: 13,
      name: "Marc Forster"
    });
    Director.saveAll();
    Actor.instances["3"] = new Actor({
      personId: 3,
      name: "Quentin Tarantino"
    });
    Actor.instances["4"] = new Actor({
      personId: 4,
      name: "Uma Thurman",
      agent: 15
    });
    Actor.instances["5"] = new Actor({
      personId: 5,
      name: "John Travolta"
    });
    Actor.instances["6"] = new Actor({
      personId: 6,
      name: "Ewan McGregor"
    });
    Actor.instances["7"] = new Actor({
      personId: 7,
      name: "Natalie Portman"
    });
    Actor.instances["8"] = new Actor({
      personId: 8,
      name: "Keanu Reeves",
      agent: 16
    });
    Actor.instances["9"] = new Actor({
      personId: 9,
      name: "Russell Crowe",
      agent: 16
    });
    Actor.instances["10"] = new Actor({
      personId: 10,
      name: "Seth MacFarlane"
    });
    Actor.instances["11"] = new Actor({
      personId: 11,
      name: "Naomi Watts"
    });
    Actor.instances["12"] = new Actor({
      personId: 12,
      name: "Ed Harris",
      agent: 15
    });
    Actor.saveAll();
    Movie.instances["1"] = new Movie({
      movieID: "1",
      title: "Pulp Fiction",
      releaseDate: new Date(1994, 5, 12),
      director: [3],
      actor: [3,4,5]
    });
    Movie.instances["2"] = new Movie({
      movieID: "2",
      title: "Star Wars",
      releaseDate: new Date(1999, 8, 19),
      director: [2],
      actor: [6,7]
    });
    Movie.instances["3"] = new Movie({
      movieID: "3",
      title: "Dangerous Liaisons",
      releaseDate: new Date(1988, 12, 16),
      director: [1],
      actor: [8,4]
    });
    Movie.instances["4"] = new Movie({
      movieID: "4",
      title: "2015",
      releaseDate: new Date(2019, 6, 30),
      director: [1],
      actor: [9,10,11],
      category: MovieCategoryEL.TVSERIESEPISODE,
      episodeNo: 6,
      tvSeriesName: "The Loudest Voice"    
    });
    Movie.instances["5"] = new Movie({
      movieID: "5",
      title: "A Beautiful Mind",
      releaseDate: new Date(2001, 12, 21),
      director: [9],
      actor: [9,12],
      category: MovieCategoryEL.BIOGRAPHY,
      about: "14"
    });
    Movie.instances["6"] = new Movie({
      movieID: "6",
      title: "Stay",
      releaseDate: new Date(2005, 9, 24),
      director: [13],
      actor: [6,11]
    });
    Movie.saveAll();
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
function clearData() {
  if (confirm( "Do you really want to delete the entire database?")) {
    try {
      [Director, Actor, Person, Movie].forEach(Class => {
        Class.instances = {};
      });
      /*
          Director.instances = {};
          Actor.instances = {};
          Person.instances = {};
          Movie.instances = {};
      */
      localStorage["employees"] = localStorage["authors"] = localStorage["people"] = "{}";
      localStorage["books"] = "{}";
      console.log("All data cleared.");
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`);
    }
  }
}

export { generateTestData, clearData };
