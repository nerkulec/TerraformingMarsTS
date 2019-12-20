import {InteractionRequest, parseResponse} from '../game/InteractionRequest';

type Socket = import('socket.io').Socket;

export interface Messenger{
    request(request: InteractionRequest, callback: (response: any) => void): void;
}

export class SocketMessenger implements Messenger{
    constructor(protected socket: Socket){
    }

    request(request: InteractionRequest, callback: (response: any) => void){
        let info = request.getInfo();
        this.socket.emit('request', info);
        this.socket.once('response', (responseData) => { // different request+response pair names, distinguish valid and not valid responses
            callback(parseResponse(responseData));
        })
    }
}

export class MockMessenger implements Messenger{
    constructor(private responseProvider: (request: InteractionRequest) => any){
    }

    request(request: InteractionRequest, callback: (response: any) => void){
        setTimeout(() => {
            callback(this.responseProvider(request))
        }, 100);
    }
    // TODO:
    every(requests: InteractionRequest[], callback: (responses: any[]) => void){
        
    }
    // TODO:
    any(requests: InteractionRequest[], callback: (responses: any[]) => void){
        
    }
}