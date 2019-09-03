type Socket = import('socket.io').Socket;

class Messenger{
    constructor(private socket: Socket){
    }

    request = (request: ActionRequest): void => {
        this.socket.emit('request', request, (response: any) => {
            console.log(response);
        });
    };
}