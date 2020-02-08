import {Card} from "../Card"
import {Resource} from "../Resource"

export class BuildingIndustries extends Card{
    constructor(){
        super()
        this.cost = 6
        this.tags = ['building']
        this.production = [new Resource('energy', -1), new Resource('steel', 2)]
    }
}