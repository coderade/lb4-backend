import {Entity, model, property} from '@loopback/repository';

@model()
export class Armor extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
    required: true,
  })
  attack: number;

  @property({
    type: 'number',
    required: true,
  })
  defence: number;


  constructor(data?: Partial<Armor>) {
    super(data);
  }
}

export interface ArmorRelations {
  // describe navigational properties here
}

export type ArmorWithRelations = Armor & ArmorRelations;