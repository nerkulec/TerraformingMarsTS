const socket = io()

console.log('Client started')

socket.on('connect', () => {
    console.log('Connected to server')

    socket.on('hello', (fn: (data: any) => void) => {
        fn('oh hello')
    })
})