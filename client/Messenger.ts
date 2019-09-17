type Socket = import('socket.io').Socket;

interface Messenger{
    request(request: ActionRequest, gameCycle: GameCycle): void;
}

class SocketMessenger implements Messenger{
    constructor(protected socket: Socket){
    }

    request(request: ActionRequest, gameCycle: GameCycle){
        let info = request.getInfo();
        this.socket.emit('request', info);
        this.socket.once('response', (response) => {
            let nextRequest = gameCycle.next(response).value;
            if(nextRequest !== undefined){
                nextRequest.player.request(nextRequest, gameCycle);
            }
        })
    }
}

class MockMessenger implements Messenger{
    constructor(private responseProvider: (info: Object) => ActionResponse){
    }

    request(request: ActionRequest, gameCycle: GameCycle){
        let info = request.getInfo();
        let response = this.responseProvider(info);
        let nextRequest = gameCycle.next(response).value;
        if(nextRequest !== undefined){
            nextRequest.player.request(nextRequest, gameCycle);
        }
    }
}