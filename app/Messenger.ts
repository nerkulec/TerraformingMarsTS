import {InteractionRequest} from '../game/InteractionRequest'
import createIoPromise, {RequestResponseRecord, IoPromiseRecord} from 'socket.io-promise'
import {timeoutPromise} from '../game/Utils'

type Socket = import('socket.io').Socket;

export abstract class Messenger{
    abstract async requester(request: InteractionRequest): Promise<any>

    async request(request: InteractionRequest): Promise<any>{
        const response = await this.requester(request)
        if(request.valid(response)){
            return response
        }else{
            throw new Error('Invalid promise')
        }
    }

    async every(requests: InteractionRequest[]){
        const promises = requests.map(request => this.request(request))
        return await Promise.all(promises)
    }

    async any(requests: InteractionRequest[]){
        const promises = requests.map(request => this.request(request))
        return await Promise.race(promises)
    }
}

export class SocketMessenger extends Messenger{
    ioPromise: IoPromiseRecord<RequestResponseRecord>
    requester = (request: InteractionRequest) => this.ioPromise(request.getInfo())

    constructor(protected socket: Socket){
        super()
        this.ioPromise = createIoPromise(socket)
    }
}

export class MockMessenger extends Messenger{
    requester = (request: InteractionRequest) => timeoutPromise(this.responseProvider(request), 100)

    constructor(private responseProvider: (request: InteractionRequest) => any){
        super()
    }
}