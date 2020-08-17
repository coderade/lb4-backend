import {DefaultCrudRepository} from '@loopback/repository';
import {Armor, ArmorRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ArmorRepository extends DefaultCrudRepository<
  Armor,
  typeof Armor.prototype.id,
  ArmorRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Armor, dataSource);
  }
}
