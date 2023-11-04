//get access to body element, make sure document has been loaded 
//Query DOM directly
const body = document.querySelector('body')

//access the data attribute to retrieve gameId and orientation
const gameId = body.dataset.gameid
const orientation = body.dataset.orientation

console.info(`gameId: ${gameId}, orientation: ${orientation}`)

//handle onDrop
const onDrop = (src, dst, piece) => {
    console.info(`src = ${src}, dst = ${dst}, piece = ${piece}`)

    //create object called move
    const move = { src, dst, piece }

    //PATCH /chess/:gameId
    fetch(`/chess/${gameId}`, {
        method: 'PATCH', 
        headers: {
            'Content-Type': 'application/json', 
        }, 
        body: JSON.stringify(move)
    })
    .then(resp => console.info('RESPONSE: ', resp))
    .catch(err => console.error('ERROR: ', err))
}

//create config file
const config = {
    draggable: true, 
    position: 'start', 
    orientation,
    onDrop
}

//create instance of chess game
const chess = Chessboard('chess', config)

//create an sse connection on client side
const sse = new EventSource('/chess/stream')
sse.addEventListener(gameId, msg => {
    console.info('>>> SSE msg: ', msg)
    // const move = JSON.parse(msg.data)
    const { src, dst, piece } = JSON.parse(msg.data)
    console.info(`src: ${src}, dst: ${dst}, piece: ${piece}`)
    chess.move(`${src}-${dst}`)
})