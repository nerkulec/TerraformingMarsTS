import {Player} from "./Player";
import {Board} from "./Board";
import {ResourceType} from "./Resource";

export interface Requirement{
    satisfied: (player: Player, board: Board) => boolean;
}

export class OceansRequirement implements Requirement{
    constructor(private number: number, private max: boolean = false){
    }
    satisfied = (player: Player, board: Board): boolean => this.max ? board.oceans.level <= this.number : board.oceans.level >= this.number;
}

export class ProductionRequirement implements Requirement{
    constructor(private type: ResourceType, private number: number = 1){
    }
    satisfied = (player: Player, board: Board): boolean => player.getProduction(this.type) >= this.number;
}

export class TemperatureRequirement implements Requirement{
    constructor(private number: number, private max: boolean = false){
    }
    satisfied = (player: Player, board: Board): boolean => this.max ? board.temperature.level <= this.number : board.temperature.level >= this.number;
}

export class OxygenRequirement implements Requirement{
    constructor(private number: number, private max: boolean = false){
    }
    satisfied = (player: Player, board: Board): boolean => this.max ? board.oxygen.level <= this.number : board.oxygen.level >= this.number;
}