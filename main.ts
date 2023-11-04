//import 
import express from 'express'
import morgan from 'morgan'
import { engine } from 'express-handlebars'
import { v4 as uuidv4, v4 } from 'uuid'
import { EventSource } from 'express-ts-sse';

//if port not set, default 3000
const port = process.env.PORT || 3000; 

//create an instance of sse server
const sse = new EventSource()

//create an instance of application 
const app = express()

//configure renderer 
//no layout
app.engine('html', engine({ defaultLayout: false }))
app.set('view engine', 'html');

//log incoming request
app.use(morgan('combined'))

//POST /chess
app.post('/chess', express.urlencoded({ extended: true }), 
    (req, resp) => {
        const gameId = v4().substring(0,8)
        const orientation = 'white'

        resp.status(200).render('chess', { gameId, orientation })
    }
)

// GET 
app.get('/chess', 
    (req, resp) => {
        const gameId = req.query.gameId
        const orientation = `black`

        resp.status(200).render('chess', { gameId, orientation })
    }    
)

//PATCH /chess/:gameId
app.patch('/chess/:gameId', express.json(),
    (req, resp) => {
        //retrieve gameId from the path
        const gameId = req.params.gameId
        const move = req.body

        console.info(`gameId: ${gameId}: `, move)
        //sse can only send string, not binary data
        //therefore we need to stringify the data
        sse.send( { event: gameId, data: JSON.stringify(move) })

        resp.status(201).json({ timestamp: (new Date()).getTime() })

    })

//get /chess/stream
//real server to write to the connections
app.get('/chess/stream', sse.init)

//serve files from static
app.use(express.static(__dirname + '/static'))

//link to static page


//start express
app.listen(port, ()=> {
    console.info(`Application bound to port ${port} at ${new Date()}`)
})