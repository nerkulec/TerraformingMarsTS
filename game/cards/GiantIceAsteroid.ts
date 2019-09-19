import {Card} from "../Card";
import {TemperatureEffect, OceansEffect } from "../GlobalEffect";
import {Resource} from "../Resource";

export class GiantIceAsteroid extends Card{
    constructor(){
        super();
        this.cost = 41;
        this.type = 'red';
        this.tags = ['space', 'event'];
        this.effects = [new TemperatureEffect(2), new OceansEffect(2)];
        this.enemyResources = [new Resource('plant', -12)];
    }
}