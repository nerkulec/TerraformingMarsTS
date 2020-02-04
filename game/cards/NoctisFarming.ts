import {Card} from "../Card"
import {Resource} from "../Resource"
import {TemperatureRequirement} from "../Requirement"

export class NoctisFarming extends Card{
    constructor(){
        super()
        this.cost = 10
        this.tags = ['building', 'plant']
        this.resources = [new Resource('plant', 2)]
        this.production = [new Resource('megacredit', 1)]
        this.flatVictoryPoints = 1
        this.requirement = new TemperatureRequirement(-20)
    }
}