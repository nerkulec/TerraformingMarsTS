import {GameCycle} from '../game/Game';
import {ActionRequest, ActionResponse, parseResponse} from '../game/ActionRequest';

type Socket = import('socket.io').Socket;

export interface Messenger{
    request(request: ActionRequest, gameCycle: GameCycle): void;
}

export class SocketMessenger implements Messenger{
    constructor(protected socket: Socket){
    }

    request(request: ActionRequest, gameCycle: GameCycle){
        let info = request.getInfo();
        this.socket.emit('request', info);
        this.socket.once('response', (responseData) => {
            let nextRequest = gameCycle.next(parseResponse(responseData)).value;
            if(nextRequest !== undefined){
                nextRequest.player.request(nextRequest, gameCycle);
            }
        })
    }
}

export class MockMessenger implements Messenger{
    constructor(private responseProvider: (request: ActionRequest) => ActionResponse){
    }

    request(request: ActionRequest, gameCycle: GameCycle){
        let response = this.responseProvider(request);
        let nextRequest = gameCycle.next(response).value;
        if(nextRequest !== undefined){
            nextRequest.player.request(nextRequest, gameCycle);
        }
    }
}