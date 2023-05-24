/**
 * @fileOverview  Auxiliary data management procedures
 * @person Gerd Wagner
 */
import Person from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
  try {
    Person.instances["1"] = new Person({
      personId: 1,
      name: "Stephen Frears"
    });
    Person.instances["2"] = new Person({
      personId: 2,
      name: "George Lucas"
    });
    Person.instances["3"] = new Person({
      personId: 3,
      name: "Quentin Tarantino"
    });
    Person.instances["5"] = new Person({
      personId: 5,
      name: "Uma Thurman"
    });
    Person.instances["6"] = new Person({
      personId: 6,
      name: "John Travolta"
    });
    Person.instances["7"] = new Person({
      personId: 7,
      name: "Ewan McGregor"
    });
    Person.instances["8"] = new Person({
      personId: 8,
      name: "Natalie Portman"
    });
    Person.instances["9"] = new Person({
      personId: 9,
      name: "Keanu Reeves"
    });

    Person.saveAll();

    Movie.instances["1"] = new Movie({
      movieID: "1",
      title: "Pulp Fiction",
      releaseDate: new Date(1994, 5, 12),
      directorIdRefs: [3],
      actorIdRefs: [3,5,6]
    });
    Movie.instances["2"] = new Movie({
      movieID: "2",
      title: "Star Wars",
      releaseDate: new Date(1977, 5, 25),
      directorIdRefs: [2],
      actorIdRefs: [7,8]
    });
    Movie.instances["3"] = new Movie({
      movieID: "3",
      title: "Dangerous Liaisons",
      releaseDate: new Date(1943, 1, 23),
      directorIdRefs: [1],
      actorIdRefs: [5,9]
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
      Person.instances = {};
      localStorage["persons"] = "{}";
      Movie.instances = {};
      localStorage["movies"] = "{}";
      console.log("All data cleared.");
    } catch (e) {
      console.log( `${e.constructor.name}: ${e.message}`);
    }
  }
}

export { generateTestData, clearData };
