/**
 * @fileOverview  View code of UI for managing Movie data
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Movie, { MovieCategoryEL } from "../m/Movie.mjs";
import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"
import { fillSelectWithOptions } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Movie.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
/**
 * Setup User Interface
 */
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', refreshManageDataUI);
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
  Movie.saveAll();
});

/**********************************************
 * Use case Retrieve/List Movies
**********************************************/
document.getElementById("RetrieveAndListAll")
    .addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Movie-R > table > tbody");
  // reset view table (drop its previous contents)
  tableBodyEl.innerHTML = "";
  // populate view table
  for (const key of Object.keys( Movie.instances)) {
    const movie = Movie.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = movie.movieID;
    row.insertCell().textContent = movie.title;
    row.insertCell().textContent = movie.releaseDate;
    row.insertCell().textContent = movie.Director[0].name;
    row.insertCell().textContent = movie.Actor.map( a => a.name).join(", ");
    if (movie.category) {
      switch (movie.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        row.insertCell().textContent = movie.episodeNo;
        row.insertCell().textContent = movie.tvSeriesName;
        break;
      case MovieCategoryEL.BIOGRAPHY:
        row.insertCell().textContent = "Biography about " + movie.about;
        break;
      }
    }
  }
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "block";
});

/**********************************************
 * Use case Create Movie
**********************************************/
const createFormEl = document.querySelector("section#Movie-C > form"),
      createCategorySelectEl = createFormEl.category;
//----- set up event handler for menu item "Create" -----------
document.getElementById("Create").addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  undisplayAllSegmentFields( createFormEl, MovieCategoryEL.labels);
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.movieID.addEventListener("input", function () {
  createFormEl.movieID.setCustomValidity(
    Movie.checkIsbnAsId( createFormEl.movieID.value).message);
});
createFormEl.subjectArea.addEventListener("input", function () {
  createFormEl.subjectArea.setCustomValidity(
    Movie.checkSubjectArea( createFormEl.subjectArea.value,
      parseInt( createFormEl.category.value) + 1).message);
});
createFormEl.about.addEventListener("input", function () {
  createFormEl.about.setCustomValidity(
    Movie.checkAbout( createFormEl.about.value,
      parseInt( createFormEl.category.value) + 1).message);
});
/* SIMPLIFIED CODE: no responsive validation of title */

// set up the movie category selection list
fillSelectWithOptions( createCategorySelectEl, MovieCategoryEL.labels);
createCategorySelectEl.addEventListener("change", handleCategorySelectChangeEvent);

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const categoryStr = createFormEl.category.value;
  const slots = {
    movieID: createFormEl.movieID.value,
    title: createFormEl.title.value,
    releaseDate: createFormEl.releaseDate.value
  };
  if (categoryStr) {
    // enum literal indexes start with 1
    slots.category = parseInt( categoryStr) + 1;
    switch (slots.category) {
    case MovieCategoryEL.TEXTBOOK:
      slots.subjectArea = createFormEl.subjectArea.value;
      createFormEl.subjectArea.setCustomValidity(
        Movie.checkSubjectArea( createFormEl.subjectArea.value, slots.category).message);
      break;
    case MovieCategoryEL.BIOGRAPHY:
      slots.about = createFormEl.about.value;
      createFormEl.about.setCustomValidity(
        Movie.checkAbout( createFormEl.about.value, slots.category).message);
      break;
    }
  }
  // check all input fields and show error messages
  createFormEl.movieID.setCustomValidity(
      Movie.checkIsbnAsId( slots.movieID).message);
  /* Incomplete code: no on-submit validation of "title" and "releaseDate" */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    Movie.add( slots);
    // un-render all segment/category-specific fields
    undisplayAllSegmentFields( createFormEl, MovieCategoryEL.labels);
  }
});

/**********************************************
 * Use case Update Movie
**********************************************/
const updateFormEl = document.querySelector("section#Movie-U > form"),
      updateSelectMovieEl = updateFormEl["selectMovie"],
      updateSelectCategoryEl = updateFormEl["category"];
undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
// handle click event for the menu item "Update"
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updateSelectMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updateSelectMovieEl, Movie.instances,
      "movieID", {displayProp:"title"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";
  updateFormEl.reset();
});
updateSelectMovieEl.addEventListener("change", handleMovieSelectChangeEvent);
// set up the movie category selection list
fillSelectWithOptions( updateSelectCategoryEl, MovieCategoryEL.labels);
updateSelectCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);

/* Incomplete code: no responsive validation of "title" and "releaseDate" */
// responsive validation of form fields for segment properties
updateFormEl.subjectArea.addEventListener("input", function () {
  updateFormEl.subjectArea.setCustomValidity(
      Movie.checkSubjectArea( updateFormEl.subjectArea.value,
          parseInt( updateFormEl.category.value) + 1).message);
});
updateFormEl.about.addEventListener("input", function () {
  updateFormEl.about.setCustomValidity(
      Movie.checkAbout( updateFormEl.about.value,
          parseInt( updateFormEl.category.value) + 1).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const categoryStr = updateFormEl.category.value;
  const movieIdRef = updateSelectMovieEl.value;
  if (!movieIdRef) return;
  var slots = {
    movieID: updateFormEl.movieID.value,
    title: updateFormEl.title.value,
    releaseDate: updateFormEl.releaseDate.value
  };
  if (categoryStr) {
    slots.category = parseInt( categoryStr) + 1;
    switch (slots.category) {
    case MovieCategoryEL.TEXTBOOK:
      slots.subjectArea = updateFormEl.subjectArea.value;
      updateFormEl.subjectArea.setCustomValidity(
        Movie.checkSubjectArea( slots.subjectArea, slots.category).message);
      break;
    case MovieCategoryEL.BIOGRAPHY:
      slots.about = updateFormEl.about.value;
      updateFormEl.about.setCustomValidity(
          Movie.checkAbout( slots.about, slots.category).message);
      break;
    }
  }
  // check all input fields and show error messages
  updateFormEl.movieID.setCustomValidity( Movie.checkIsbn( slots.movieID).message);
  /* Incomplete code: no on-submit validation of "title" and "releaseDate" */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    Movie.update( slots);
    // un-render all segment/category-specific fields
    undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
    // update the movie selection list's option element
    updateSelectMovieEl.options[updateSelectMovieEl.selectedIndex].text = slots.title;
  }
});
/**
 * handle movie selection events
 * when a movie is selected, populate the form with the data of the selected movie
 */
function handleMovieSelectChangeEvent () {
  const movieID = updateFormEl.selectMovie.value;
  if (movieID) {
    const movie = Movie.instances[movieID];
    updateFormEl.movieID.value = movie.movieID;
    updateFormEl.title.value = movie.title;
    updateFormEl.releaseDate.value = movie.releaseDate;
    if (movie.category) {
      updateFormEl.category.selectedIndex = movie.category;
      // disable category selection (category is frozen)
      updateFormEl.category.disabled = "disabled";
      // show category-dependent fields
      displaySegmentFields( updateFormEl, MovieCategoryEL.labels, movie.category);
      switch (movie.category) {
      case MovieCategoryEL.TEXTBOOK:
        updateFormEl.subjectArea.value = movie.subjectArea;
        updateFormEl.about.value = "";
        break;
      case MovieCategoryEL.BIOGRAPHY:
        updateFormEl.about.value = movie.about;
        updateFormEl.subjectArea.value = "";
        break;
      }
    } else {  // movie has no value for category
      updateFormEl.category.value = "";
      updateFormEl.category.disabled = "";   // enable category selection
      updateFormEl.subjectArea.value = "";
      updateFormEl.about.value = "";
      undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
    }
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 * Use case Delete Movie
**********************************************/
const deleteFormEl = document.querySelector("section#Movie-D > form");
const delSelMovieEl = deleteFormEl.selectMovie;
// set up event handler for Update button
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelMovieEl, Movie.instances,
      "movieID", {displayProp:"title"});
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

/**
 * event handler for movie category selection events
 * used both in create and update
 */
function handleCategorySelectChangeEvent (e) {
  const formEl = e.currentTarget.form,
        // the array index of MovieCategoryEL.labels
        categoryIndexStr = formEl.category.value;
  if (categoryIndexStr) {
    displaySegmentFields( formEl, MovieCategoryEL.labels,
        parseInt( categoryIndexStr) + 1);
  } else {
    undisplayAllSegmentFields( formEl, MovieCategoryEL.labels);
  }
}

// Set up Manage Movies UI
refreshManageDataUI();
