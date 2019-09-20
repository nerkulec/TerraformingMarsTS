import {ActionRequest, ActionResponse, parseResponse} from '../game/ActionRequest';

type Socket = import('socket.io').Socket;

export interface Messenger{
    request(request: ActionRequest, callback: (response: ActionResponse) => void): void;
}

export class SocketMessenger implements Messenger{
    constructor(protected socket: Socket){
    }

    request(request: ActionRequest, callback: (response: ActionResponse) => void){
        let info = request.getInfo();
        this.socket.emit('request', info);
        this.socket.once('response', (responseData) => { // different request+response pair names, distinguish valid and not valid responses
            callback(parseResponse(responseData));
        })
    }
}

export class MockMessenger implements Messenger{
    constructor(private responseProvider: (request: ActionRequest) => ActionResponse){
    }

    request(request: ActionRequest, callback: (response: ActionResponse) => void){
        setTimeout(() => {
            callback(this.responseProvider(request))
        }, 500);
    }
}