type ResourceType = "megacredit"|"steel"|"titanium"|"plant"|"energy"|"heat";

class Resource{
    constructor(public type: ResourceType, public amount: number = 1){
    }
}