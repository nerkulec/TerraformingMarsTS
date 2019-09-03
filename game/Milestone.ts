interface Milestone{
    claimable: (player: Player) => boolean;
}

class Terraformer implements Milestone{
    claimable = (player: Player): boolean => player.terraformingRating >= 35;

}