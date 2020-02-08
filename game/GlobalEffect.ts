import {Player} from "./Player"
import {Board} from "./Board"

export type GlobalEffectType = "temperatureEffect"|"oxygenEffect"|"oceansEffect"

export abstract class GlobalEffect{
    constructor(public times: number){
    }
    abstract type: GlobalEffectType
    abstract effect(player: Player, board: Board): void
}

export class TemperatureEffect extends GlobalEffect{
    type = "temperatureEffect" as GlobalEffectType
    constructor(public times: number = 1){
        super(times)
    }
    effect(player: Player, board: Board): void {
        board.temperature.increment(player, this.times)
    }
}

export class OxygenEffect extends GlobalEffect{
    type = "oxygenEffect" as GlobalEffectType
    constructor(public times: number = 1){
        super(times)
    }
    effect(player: Player, board: Board): void {
        board.oxygen.increment(player, this.times)
    }
}

export class OceansEffect extends GlobalEffect{
    type = "oceansEffect" as GlobalEffectType
    constructor(public times: number = 1){
        super(times)
    }
    effect(player: Player, board: Board): void {
        board.oceans.increment(player, this.times)
    }
}