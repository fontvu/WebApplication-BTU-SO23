/**
 * @fileOverview  View code of UI for managing Movie data
 * @person Gerd Wagner
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Person from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";
import { fillSelectWithOptions, createListFromMap, createMultiSelectionWidget }
    from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Person.retrieveAll();
Movie.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all CRUD UIs
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
// neutralize the submit event for all CRUD UIs
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", Movie.saveAll);

/**********************************************
 Use case Retrieve/List All Movies
 **********************************************/
document.getElementById("RetrieveAndListAll")
    .addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "block";
  const tableBodyEl = document.querySelector("section#Movie-R>table>tbody");
  tableBodyEl.innerHTML = "";  // drop old content
  for (const key of Object.keys( Movie.instances)) {
    const movie = Movie.instances[key];
    // create list of persons for this movie
    const authListEl = createListFromMap( movie.actor, "name");
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = movie.movieID;
    row.insertCell().textContent = movie.title;
    row.insertCell().textContent = movie.releaseDate.toLocaleDateString();
    row.insertCell().textContent = movie.director.name;
    row.insertCell().appendChild( authListEl);
  }
});

/**********************************************
  Use case Create Movie
 **********************************************/
const createFormEl = document.querySelector("section#Movie-C > form"),
      selectPersonsEl = createFormEl["selectActors"],
      selectDirectorEl = createFormEl["selectDirector"];
document.getElementById("Create").addEventListener("click", function () {
  // set up a single selection list for selecting a publisher
  fillSelectWithOptions( selectDirectorEl, Person.instances,
    "personId", {displayProp: "name"});  // set up a multiple selection list for selecting persons
  fillSelectWithOptions( selectPersonsEl, Person.instances,
      "personId", {displayProp: "name"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.movieID.addEventListener("input", function () {
  createFormEl.movieID.setCustomValidity(
      Movie.checkMovieIDAsId( createFormEl["movieID"].value).message);
});
/* SIMPLIFIED/MISSING CODE: add event listeners for responsive
   validation on user input with Movie.checkTitle and checkYear */

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    movieID: createFormEl["movieID"].value,
    title: createFormEl["title"].value,
    releaseDate: createFormEl["releaseDate"].value,
    actorIdRefs: [],
    directorIdRefs: []
  };
  // check all input fields and show error messages
  createFormEl.movieID.setCustomValidity(
      Movie.checkMovieIDAsId( slots.movieID).message);
  createFormEl.title.setCustomValidity(
      Movie.checkTitle( slots.title).message);
  createFormEl.releaseDate.setCustomValidity(
      Movie.checkReleaseDate( slots.releaseDate).message);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // get the list of selected persons
  const selActOptions = createFormEl.selectActors.selectedOptions;
  // check the mandatory value constraint for persons
  createFormEl.selectActors.setCustomValidity(
      selActOptions.length > 0 ? "" : "No person selected!"
  );
  const selDirectorOptions = createFormEl.selectDirector.selectedOptions;
  // check the mandatory value constraint for persons
  createFormEl.selectDirector.setCustomValidity(
    selDirectorOptions.length > 0 ? "" : "No person selected!"
  );
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    // construct a list of person ID references
    for (const actorOpt of selActOptions) {
      slots.actorIdRefs.push( actorOpt.value);
    }
    for (const directorOpt of selDirectorOptions) {
      slots.directorIdRefs.push( directorOpt.value);
    }
    Movie.add( slots);
  }
});

/**********************************************
 * Use case Update Movie
**********************************************/
const updateFormEl = document.querySelector("section#Movie-U > form"),
      updSelMovieEl = updateFormEl["selectMovie"];
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updSelMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updSelMovieEl, Movie.instances,
      "movieID", {displayProp: "title"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";
  updateFormEl.reset();
});
/**
 * handle movie selection events: when a movie is selected,
 * populate the form with the data of the selected movie
 */
updSelMovieEl.addEventListener("change", function () {
  const saveButton = updateFormEl["commit"],
    selectPersonsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
    selectDirectorEl = updateFormEl["selectDirector"],
    selectActorEl = updateFormEl["selectActors"],
    movieID = updateFormEl["selectMovie"].value;
  if (movieID) {
    const movie = Movie.instances[movieID];
    updateFormEl["movieID"].value = movie.movieID;
    updateFormEl["title"].value = movie.title;
    updateFormEl["releaseDate"].value = `${movie.releaseDate.getFullYear()}-${(movie.releaseDate.getMonth()+1).toString().padStart(2, '0')}-${(movie.releaseDate.getDate()+1).toString().padStart(2, '0')}`;
    fillSelectWithOptions( selectDirectorEl, Person.instances,
      "personId", {displayProp: "name"});
    // set up the associated persons selection widget
    createMultiSelectionWidget( selectPersonsWidget, movie.actor,
        Person.instances, "personId", "name", 1);  // minCard=1
    
    saveButton.disabled = false;
  }
});
// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = updSelMovieEl.value,
    selectPersonsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
    selectedPersonsListEl = selectPersonsWidget.firstElementChild;
  if (!movieIdRef) return;
  const slots = {
    movieID: updateFormEl["movieID"].value,
    title: updateFormEl["title"].value,
    releaseDate: updateFormEl["releaseDate"].value,
    directorIdRefs: updateFormEl["selectDirector"].value
  };
  // add event listeners for responsive validation
  /* MISSING CODE */
  // commit the update only if all form field values are valid
  if (updateFormEl.checkValidity()) {
    // construct personIdRefs-ToAdd/ToRemove lists
    const personIdRefsToAdd=[], personIdRefsToRemove=[];
    for (const personItemEl of selectedPersonsListEl.children) {
      if (personItemEl.classList.contains("removed")) {
        personIdRefsToRemove.push( personItemEl.getAttribute("data-value"));
      }
      if (personItemEl.classList.contains("added")) {
        personIdRefsToAdd.push( personItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty, create a corresponding slot
    if (personIdRefsToRemove.length > 0) {
      slots.actorIdRefsToRemove = personIdRefsToRemove;
    }
    if (personIdRefsToAdd.length > 0) {
      slots.actorIdRefsToAdd = personIdRefsToAdd;
    }
    Movie.update( slots);
    // update the movie selection list's option element
    updSelMovieEl.options[updSelMovieEl.selectedIndex].text = slots.title;
    // drop widget content
    selectPersonsWidget.innerHTML = "";
  }
});

/**********************************************
 * Use case Delete Movie
**********************************************/
const deleteFormEl = document.querySelector("section#Movie-D > form");
const delSelMovieEl = deleteFormEl["selectMovie"];
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelMovieEl, Movie.instances,
      "movieID", {displayProp: "title"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-D").style.display = "block";
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = delSelMovieEl.value;
  if (!movieIdRef) return;
  if (confirm("Do you really want to delete this movie?")) {
    Movie.destroy( movieIdRef);
    // remove deleted movie from select options
    delSelMovieEl.remove( delSelMovieEl.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Movies Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage movie UI and hide the other UIs
  document.getElementById("Movie-M").style.display = "block";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";
}

// Set up Manage Movie UI
refreshManageDataUI();
