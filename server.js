require('dotenv').config();
const express = require('express');
const fs = require('fs');


const app = express();
const PORT = process.env.PORT || 3008;
const PATH_json = process.env.PATH_json || './database/trailerflix.json';

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
// Endpoint para obtener todo el catálogo de series y peliculas
app.get('/catalogo', (req, res) => {
    if (!TRAILERFLIX) {
        return res.status(500).json({ error: 'Datos no cargados' });
    }

    try {
        res.status(200).json(TRAILERFLIX);
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar el catálogo de TrailerFlix' });
    }
});

// Endpoint para buscar por título: completo o parcial
app.get('/titulo/:tit', (req, res) => {
    if (!TRAILERFLIX) {
        return res.status(500).json({ error: 'Datos no cargados' });
    }

    try {
        const tituloIngresado = req.params.tit.toLowerCase();
        const resultado = TRAILERFLIX.filter(peliSerie => peliSerie.titulo.toLowerCase().includes(tituloIngresado));

        if (resultado.length === 0) {
            return res.status(404).json({ error: 'No se encontraron películas o series con ese título' });
        }

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar por título' });
    }
});

// Endpoint para buscar por categoría (posibles valores: serie o pelicula)
app.get('/categoria/:cat', (req, res) => {
    if (!TRAILERFLIX) {
        return res.status(500).json({ error: 'Datos no cargados' });
    }

    try {
        const categoriaBuscada = req.params.cat.toLowerCase();
        const categoriasValidas = ["película", "serie"];

        // Validar si la categoría ingresada es correcta
        if (!categoriasValidas.includes(categoriaBuscada)) {
            return res.status(400).json({ error: 'Categoría inválida. Las categorias son "película" o "serie".' });
        }

        const resultado = TRAILERFLIX.filter(peliSerie => peliSerie.categoria.toLowerCase() === categoriaBuscada);

        if (resultado.length === 0) {
            return res.status(404).json({ error: `No se encontraron ${categoriaBuscada} en TrailerFix.` });
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
