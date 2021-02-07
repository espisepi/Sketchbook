import { World } from '../ts/world/World';
import { IUpdatable } from '../ts/interfaces/IUpdatable';
export declare class CreateWorld implements IUpdatable {
    updateOrder: number;
    private world;
    constructor(world: World);
    createAll(): void;
    update(timeStep: number): void;
}
