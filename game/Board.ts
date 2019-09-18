import {Game} from "./Game";
import {Hex} from "./Hex";
import {Milestone} from "./Milestone";
import {Award} from "./Award";
import {TerraformingMarker, Temperature, Oxygen, Oceans} from "./TerraformingMarker";

export abstract class Board{
    abstract hexes: Hex[][];
    abstract spaceHexes: Hex[];
    abstract milestones: Milestone[];
    abstract awards: Award[];

    temperature: TerraformingMarker = new Temperature();
    oxygen: TerraformingMarker = new Oxygen();
    oceans: TerraformingMarker = new Oceans();

    numCities: number = 0;

    constructor(public game: Game){
        game.board = this;
    }

    getHex = (x: number, y: number): Hex => this.hexes[x][y];
}

export class Tharsis extends Board{
    hexes: Hex[][] = [];
    spaceHexes: Hex[] = [];
    milestones: Milestone[] = [];
    awards: Award[] = [];
}