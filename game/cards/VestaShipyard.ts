import {Card} from "../Card";
import {Resource} from "../Resource";

export class VestaShipyard extends Card{
    constructor(){
        super();
        this.cost = 15;
        this.tags = ['space', 'jupiter'];
        this.production = [new Resource('titanium')];
        this.flatVictoryPoints = 1;
    }
}