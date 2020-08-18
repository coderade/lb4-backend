import {Entity, hasOne, model, property} from '@loopback/repository';
import {PermissionKey} from '../authorization';
import {Armor} from './armor.model';
import {Weapon} from './weapon.model';
import {Skill} from './skill.model';

@model()
export class Character extends Entity {
    @property({
        type: 'string',
        id: true,
        required: true,
    })
    email?: string;

    @property({
        type: 'string',
        required: true,
    })
    password: string;

    @property({
        type: 'string',
        required: true,
    })
    name: string;

    @property({
        type: 'number',
    })
    level?: number;

    @property({
        type: 'number',
    })
    nextLevelExp?: number;

    @property({
        type: 'number',
    })
    currentExp?: number;

    @property({
        type: 'number',
    })
    maxHealth?: number;

    @property({
        type: 'number',
    })
    currentHealth?: number;

    @property({
        type: 'number',
    })
    maxMana?: number;

    @property({
        type: 'number',
    })
    currentMana?: number;

    @property({
        type: 'number',
    })
    attack?: number;

    @property({
        type: 'number',
    })
    defence?: number;

    @property.array(String)
    permissions: PermissionKey[];



    @hasOne(() => Armor)
    armor?: Armor;

    @hasOne(() => Weapon)
    weapon?: Weapon;

    @hasOne(() => Skill)
    skill?: Skill;

    constructor(data?: Partial<Character>) {
        super(data);
    }
}

export interface CharacterRelations {
    // describe navigational properties here
}

export type CharacterWithRelations = Character & CharacterRelations;
