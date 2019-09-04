enum GlobalEffectType{
    temperatureEffect,
    oxygenEffect,
    oceansEffect
}

abstract class GlobalEffect{
    constructor(public times: number){
    }
    abstract type: GlobalEffectType;
    abstract effect(player: Player, board: Board): void;
}

class TemperatureEffect extends GlobalEffect{
    type = GlobalEffectType.temperatureEffect;
    constructor(public times: number = 1){
        super(times);
    }
    effect(player: Player, board: Board): void {
        board.temperature.increment(player);
    }
}

class OxygenEffect extends GlobalEffect{
    type = GlobalEffectType.oxygenEffect;
    constructor(public times: number = 1){
        super(times);
    }
    effect(player: Player, board: Board): void {
        board.oxygen.increment(player);
    }
}

class OceansEffect extends GlobalEffect{
    type = GlobalEffectType.oceansEffect;
    constructor(public times: number = 1){
        super(times);
    }
    effect(player: Player, board: Board): void {
        // TODO: placing of an ocean
        board.oceans.increment(player);
    }
}