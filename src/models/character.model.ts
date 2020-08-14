import {Entity, model, property} from '@loopback/repository';

@model()
export class Character extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id?: number;

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
  attack?: number;

  @property({
    type: 'number',
  })
  defence?: number;


  constructor(data?: Partial<Character>) {
    super(data);
  }
}

export interface CharacterRelations {
  // describe navigational properties here
}

export type CharacterWithRelations = Character & CharacterRelations;
