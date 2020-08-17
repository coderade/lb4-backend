import {DefaultCrudRepository} from '@loopback/repository';
import {Skill, SkillRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class SkillRepository extends DefaultCrudRepository<
  Skill,
  typeof Skill.prototype.id,
  SkillRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Skill, dataSource);
  }
}
