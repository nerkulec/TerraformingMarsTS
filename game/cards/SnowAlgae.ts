import {Card} from '../Card'
import {Resource} from '../Resource'
import {OceansRequirement} from '../Requirement'

export class SnowAlgae extends Card{
    constructor(){
        super()
        this.cost = 12
        this.tags = ['plant']
        this.production = [new Resource('heat'), new Resource('plant')]
        this.requirement = new OceansRequirement(2)
    }
}