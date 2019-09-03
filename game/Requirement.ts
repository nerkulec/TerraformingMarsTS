interface Requirement{
    satisfied: (player: Player, board: Board) => boolean;
}

class OceansRequirement implements Requirement{
    constructor(private number: number, private max: boolean = false){
    }
    satisfied = (player: Player, board: Board): boolean => this.max ? board.oceans.level <= this.number : board.oceans.level >= this.number;
}

class ProductionRequirement implements Requirement{
    constructor(private type: ResourceType, private number: number = 1){
    }
    satisfied = (player: Player, board: Board): boolean => player.getProduction(this.type) >= this.number;
}