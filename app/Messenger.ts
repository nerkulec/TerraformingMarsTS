import {InteractionRequest, ChooseAction} from '../game/InteractionRequest'
import createIoPromise, {RequestResponseRecord, IoPromiseRecord} from 'socket.io-promise'
import {timeoutPromise} from '../game/Utils'

type Socket = import('socket.io').Socket

export abstract class Messenger{
    abstract async requester(request: InteractionRequest): Promise<any>

    async request(request: InteractionRequest): Promise<any>{
        let response
        for(let i=0; i<10; i++){
            response = request.parse(await this.requester(request))
            if(request.valid(response)){
                break
            }else{
                console.log('Invalid response')
                request.message = 'Invalid response'
            }
        }
        return response
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
    responses: {[key: string]: any[]} = {}

    requester = (request: InteractionRequest) => {
        let r = this.responses[request.type]
        return timeoutPromise(r.shift(), 10)
    }

    addResponse(type: string, response: any) {
        this.responses[type] = (this.responses[type] || []).concat([response])
    }

    addResponses(type: string, responses: any[]) {
        this.responses[type] = (this.responses[type] || []).concat(responses)
    }
}