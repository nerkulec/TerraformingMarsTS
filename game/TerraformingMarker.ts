import {Player} from "./Player"

enum TerraformingMarkerType{
    temperature,
    oxygen,
    oceans
}

export abstract class TerraformingMarker{
    level: number

    constructor(public min: number, public max: number, public step: number){
        this.level = min
    }

    increment(player: Player, times: number = 1): void {
        for(let i=0; i<times; i++){
            if(this.level<this.max){
                this.level += this.step
                player.terraformingRating += 1
            }
        }
    }
}

export class Temperature extends TerraformingMarker{
    constructor(){
        super(-30, 8, 2)
    }
}

export class Oxygen extends TerraformingMarker{
    constructor(){
        super(0, 14, 1)
    }
}

export class Oceans extends TerraformingMarker{
    constructor(){
        super(0, 9, 1)
    }
}