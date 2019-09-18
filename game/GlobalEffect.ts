import {Player} from "./Player";
import {Board} from "./Board";

export type GlobalEffectType = "temperatureEffect"|"oxygenEffect"|"oceansEffect";

export abstract class GlobalEffect{
    constructor(public times: number){
    }
    abstract type: GlobalEffectType;
    abstract effect(player: Player, board: Board): void;
}

export class TemperatureEffect extends GlobalEffect{
    type = "temperatureEffect";
    constructor(public times: number = 1){
        super(times);
    }
    effect(player: Player, board: Board): void {
        board.temperature.increment(player);
    }
}

export class OxygenEffect extends GlobalEffect{
    type = "oxygenEffect";
    constructor(public times: number = 1){
        super(times);
    }
    effect(player: Player, board: Board): void {
        board.oxygen.increment(player);
    }
}

export class OceansEffect extends GlobalEffect{
    type = "oceansEffect";
    constructor(public times: number = 1){
        super(times);
    }
    effect(player: Player, board: Board): void {
        // TODO: placing of an ocean
        board.oceans.increment(player);
    }
}