import {DefaultCrudRepository} from '@loopback/repository';
import {Weapon, WeaponRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class WeaponRepository extends DefaultCrudRepository<
  Weapon,
  typeof Weapon.prototype.id,
  WeaponRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Weapon, dataSource);
  }
}
