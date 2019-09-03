enum ResourceType{
    Megacredit,
    Steel,
    Titanium,
    Plant,
    Energy,
    Heat
}

class Resource{
    constructor(public type: ResourceType, public amount: number){
    }
}