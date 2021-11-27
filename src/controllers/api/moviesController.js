const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');
const { listeners } = require('cluster');


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    list: async (req, res) => {
        try {
            let movies = await Movies.findAll({
            include: ['genre']
            })
            let response = {
                meta : {
                    status : 200,
                    url : "api/movies",
                    message: "Listado de peliculas"
                },
                data : movies
            }
            return res.status(200).json(response)
        } catch (error) {
            return res.status(error.status || 500).json(error)
        }
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id,
            {
                include : ['genre']
            })
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            include: ['genre'],
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    create: async function (req,res) {
        try {
            let movie = await Movies.create({
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            })
            let response = {
                meta : {
                    status : 201,
                    message: `Pelicula ${req.body.title} creada con exito`,
                    url : "api/movies/create"
                },
                data : movie
            }
            return res.status(201).json(response)
        } catch (error) {
            return res.status(error.status || 500).json(error)
        }
    },
    destroy: async function (req,res) {
        try {
                await Movies.destroy(
                {where : {id : req.params.id}}
            )
            let response = {
                meta : {
                    status : 201,
                    url : `/api/movies/delete/`,
                    message : `La pelicula fue eliminada con exito`
                },
                data : Movies.findOne({paranoid : false,
                    where : {id : req.params.id},
                }
                )
                .then(movie =>{return res.status(201).json(response)})
            }
           /*  return res.status(201).json(response) */
        } catch (error) {
            return res.status(error.status || 500).json(error)
        }
        /* let movieId = req.params.id;
        Movies
        .destroy({where: {id: movieId}, force: true}) // force: true es para asegurar que se ejecute la acción
        .then(()=>{
            return res.redirect('/movies')})
        .catch(error => res.send(error))  */
      /*       Movies.restore({
                where: {
                    id : req.params.id  // nos sirve para restaurar un registro con un soft delete
                }
            }), */
    }
}

module.exports = moviesController;