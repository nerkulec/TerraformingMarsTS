enum GlobalEffectType{
    temperatureEffect,
    oxygenEffect,
    oceansEffect
}

abstract class GlobalEffect{
    constructor(public times: number){
    }
    abstract type: GlobalEffectType;
}

class TemperatureEffect extends GlobalEffect{
    type = GlobalEffectType.temperatureEffect;
    constructor(public times: number = 1){
        super(times);
    }
}

class OxygenEffect extends GlobalEffect{
    type = GlobalEffectType.oxygenEffect;
    constructor(public times: number = 1){
        super(times);
    }
}

class OceansEffect extends GlobalEffect{
    type = GlobalEffectType.oceansEffect;
    constructor(public times: number = 1){
        super(times);
    }
}