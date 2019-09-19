export type HexType = "city"|"greenery"|"ocean";

export class Place{
    constructor(public x: number, public y: number){
    }
}

export class Hex{
    constructor(public type: HexType){
    }
}