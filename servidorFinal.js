require('dotenv').config();
const express = require('express');
const fs = require('fs');


const app = express();
const PORT = process.env.PORT || 3008;
const PATH_json = process.env.PATH_json || './trailerflix.json';

let TRAILERFLIX; 

fs.readFile(PATH_json, 'utf-8', (err, data) => {
    if (err) {
        console.error('Error al leer el archivo:', err);
        return;
    }
    TRAILERFLIX = JSON.parse(data);
    console.log('json cargado correctamente');
});


// Ruta raíz
app.get('/', (req, res) => {
    res.send('<h1>Trailerflix</h1><p>El mejor contenido de películas y series.</p>');
});

//Aqui irian los endpoints de Silvia

// Endpoint que devuelve todo el catalogo
app.get('/catalogo', (req, res) => {
    if (!TRAILERFLIX) {
        return res.status(500).json({ error: 'Datos no cargados' });
    }

    try {
        res.status(200).json(TRAILERFLIX);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el catálogo' });
    }
});

// Endpoint para buscar peliculas de manera parcial por titulo
app.get('/titulo/:title', (req, res) => {
    if (!TRAILERFLIX) {
        return res.status(500).json({ error: 'Datos no cargados' });
    }

    try {
        const tituloBuscado = req.params.title.toLowerCase();

        const resultado = TRAILERFLIX.filter(peliSerie =>
            peliSerie.titulo && peliSerie.titulo.trim().toLowerCase().includes(tituloBuscado)
        );

        if (resultado.length === 0) {
            return res.status(404).json({ error: 'No se encontraron títulos que coincidan con tu busqueda' });
        }

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar por título' });
    }
});

// Endpoint para buscar por categoria (Serie o Película)
app.get('/categoria/:cat', (req, res) => {
    if (!TRAILERFLIX) {
        return res.status(500).json({ error: 'Datos no cargados' });
    }

    try {
        const categoriaBuscada = req.params.cat.toLowerCase();

        const resultado = TRAILERFLIX.filter(peliSerie =>
            peliSerie.categoria && peliSerie.categoria.toLowerCase() === categoriaBuscada
        );

        if (resultado.length === 0) {
            return res.status(404).json({ error: 'No se encontraron resultados para esa categoría' });
        }

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar por categoría' });
    }
});



// Endpoint para buscar películas por actor/actriz
app.get('/reparto/:act', (req, res) => {
    if (!TRAILERFLIX) {
        return res.status(500).json({ error: 'Datos no cargados' });
    }

    try {
        const actorBuscado = req.params.act.toLowerCase();
        const resultado = TRAILERFLIX.filter(peliSerie => 
            peliSerie.reparto && peliSerie.reparto.split(',').some(actor => actor.trim().toLowerCase().includes(actorBuscado))
        ).map(peliSerie => ({ titulo: peliSerie.titulo, reparto: peliSerie.reparto }));
        

        if (resultado.length === 0) {
            return res.status(404).json({ error: 'No se encontraron películas o series con ese actor/actriz' });
        }

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar por actor/actriz' });
    }
});

// Endpoint para obtener el tráiler de una película por medio de su id
app.get('/trailer/:id', (req, res) => {
    if (!TRAILERFLIX) {
        return res.status(500).json({ error: 'Datos no cargados' });
    }

    try {
        const idBuscado = req.params.id;
        const resultado = TRAILERFLIX.find(peliSerie => peliSerie.id == idBuscado);

        if (!resultado) {
            return res.status(404).json({ error: 'No se encontró una película con ese ID' });
        }

        res.status(200).json({ id: resultado.id, titulo: resultado.titulo, trailer: resultado?.trailer || "Trailer no disponible" });
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar el tráiler' });
    }
});

// Middleware para manejar rutas inexistentes
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada. Verifica la URL." });
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});