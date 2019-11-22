import
{
    CharacterStateBase,
    EndWalk,
    JumpRunning,
    Walk,
} from './_stateLibrary';
import { Character } from '../Character';

export class Sprint extends CharacterStateBase
{
    constructor(character: Character)
    {
        super(character);

        this.character.velocitySimulator.mass = 10;
        this.character.rotationSimulator.damping = 0.8;
        this.character.rotationSimulator.mass = 50;

        this.character.setArcadeVelocityTarget(1.4);
        this.character.setAnimation('sprint', 0.1);

        if (!this.isPressed(this.character.actions.run))
        {
            this.character.setState(Walk);
        }
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);
        this.character.setCameraRelativeOrientationTarget();
        this.fallInAir();
    }

    public onInputChange(): void
    {
        if (this.justReleased(this.character.actions.run))
        {
            this.character.setState(Walk);
        }

        if (this.justPressed(this.character.actions.jump))
        {
            this.character.setState(JumpRunning);
        }

        if (this.noDirection())
        {
            this.character.setState(EndWalk);
        }
    }
}