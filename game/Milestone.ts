import {Player} from "./Player"

export interface Milestone{
    claimable: (player: Player) => boolean
}

export class Terraformer implements Milestone{
    claimable = (player: Player): boolean => player.terraformingRating >= 35

}