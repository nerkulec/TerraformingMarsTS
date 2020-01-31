import {Player} from "./Player"
import {Game} from "./Game"

export abstract class Award{
    abstract getPoints: (player: Player) => number

    assignPoints(game: Game): Map<Player, number> {
        let standings: Player[] = game.players.slice()
        standings.sort((a, b) => this.getPoints(b)-this.getPoints(a))
        let pointAssignment: Map<Player, number> = new Map<Player, number>()
        if(standings.length > 2){
            if(this.getPoints(standings[0]) > this.getPoints(standings[1])){
                pointAssignment.set(standings[0], 5)
                for(const player of standings){
                    if(this.getPoints(player) == this.getPoints(standings[1])){
                        pointAssignment.set(player, 2)
                    }
                }
            }else{
                for(const player of standings){
                    if(this.getPoints(player) == this.getPoints(standings[0])){
                        pointAssignment.set(player, 5)
                    }
                }
            }
        }else{
            if(this.getPoints(standings[0]) > this.getPoints(standings[1])){
                pointAssignment.set(standings[0], 5)
            }else{
                pointAssignment.set(standings[0], 5)
                pointAssignment.set(standings[1], 5)
            }
        }
        return pointAssignment
    }
}

export class Banker extends Award{
    getPoints = (player: Player): number => player.getProduction("megacredit")
}