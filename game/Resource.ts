export type ResourceType = "megacredit"|"steel"|"titanium"|"plant"|"energy"|"heat"

export class Resource{
    constructor(public type: ResourceType, public amount: number = 1){
    }
}