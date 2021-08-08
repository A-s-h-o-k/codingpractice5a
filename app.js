const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
let dataPath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let dataBase = null;
const integrateServerAndDatabase = async () => {
  try {
    dataBase = await open({
      filename: dataPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started at http://localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
  }
};
integrateServerAndDatabase();

//API 1 get all movies
app.get("/movies/", async (request, response) => {
  let query = `SELECT movie_name as movieName FROM movie`;
  let result = await dataBase.all(query);
  response.send(result);
});

//API 2 add Movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  let query = `INSERT INTO movie (director_id, movie_name, lead_actor)
  VALUES('${directorId}', '${movieName}', '${leadActor}');`;
  let result = await dataBase.run(query);
  response.send("Movie Successfully Added");
});

//API 3 get Movie based on movie_id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      movie.movie_id = '${movieId}';`;
  const getMovie = await dataBase.get(getMovieQuery);
  response.send(getMovie);
});

//API 4 Updating Movie
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  let updateQuery = `
    UPDATE 
        movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};`;
  let updatedResult = await dataBase.run(updateQuery);
  response.send("Movie Details Updated");
});

//API 5 Delete a movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  let deleteQuery = `
    DELETE FROM
        movie
    WHERE 
    movie_id = ${movieId};`;
  let deleteResult = await dataBase.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6 GET list of all directors

app.get("/directors/", async (request, response) => {
  let directorsQuery = `
    SELECT director_id as directorId, director_name as directorName FROM director;`;
  let directorsList = await dataBase.all(directorsQuery);
  response.send(directorsList);
});

//API 7 Get Movies for particular director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  let getMoviesOfDirectors = `
  SELECT movie.movie_name as movieName
  FROM
    movie NATURAL JOIN director
  WHERE
    director.director_id = ${directorId};`;
  let getMoviesForDirector = await dataBase.all(getMoviesOfDirectors);
  response.send(getMoviesForDirector);
});
module.exports = app;
