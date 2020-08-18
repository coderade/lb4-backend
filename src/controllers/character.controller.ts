import {
    Count,
    CountSchema,
    Filter,
    FilterExcludingWhere,
    repository,
    Where,
} from '@loopback/repository';
import {
    post,
    param,
    get,
    getModelSchemaRef,
    patch,
    put,
    del,
    requestBody, HttpErrors,
} from '@loopback/rest';
import {Armor, Character, Skill, Weapon} from '../models';
import {inject, Getter} from '@loopback/core';
import {ArmorRepository, CharacterRepository, SkillRepository, WeaponRepository} from '../repositories';
import {
    MyUserProfile,
    Credential,
    MyAuthBindings,
    PermissionKey,
    CredentialsRequestBody,
    UserRequestBody,
    UserProfileSchema,
    JWTService,
} from '../authorization';
import {
    authenticate,
    TokenService,
    AuthenticationBindings,
} from '@loopback/authentication';

export class CharacterController {
    constructor(
        @repository(CharacterRepository)
        public characterRepository: CharacterRepository,
        @repository(WeaponRepository)
        public weaponRepository: WeaponRepository,
        @repository(ArmorRepository)
        public armorRepository: ArmorRepository,
        @repository(SkillRepository)
        public skillRepository: SkillRepository,
        @inject(MyAuthBindings.TOKEN_SERVICE)
        public jwtService: JWTService,
        @inject.getter(AuthenticationBindings.CURRENT_USER)
        public getCurrentUser: Getter<MyUserProfile>,
    ) {
    }

    @post('/characters', {
        responses: {
            '200': {
                description: 'Character model instance',
                content: {'application/json': {schema: getModelSchemaRef(Character)}},
            },
        },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Character, {
                        title: 'NewCharacter',
                        exclude: ['id'],
                    }),
                },
            },
        })
            character: Omit<Character, 'ID'>,
    ): Promise<Character> {
        character.permissions = [PermissionKey.ViewOwnUser,
            PermissionKey.CreateUser,
            PermissionKey.UpdateOwnUser,
            PermissionKey.DeleteOwnUser];
        if (await this.characterRepository.exists(character.email)){
            throw new HttpErrors.BadRequest(`This email already exists`);
        }
        else {
            const savedCharacter = await this.characterRepository.create(character);
            delete savedCharacter.password;
            return savedCharacter;
        }
    }

    @get('/characters/count', {
        responses: {
            '200': {
                description: 'Character model count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async count(
        @param.where(Character) where?: Where<Character>,
    ): Promise<Count> {
        return this.characterRepository.count(where);
    }

    @get('/characters', {
        responses: {
            '200': {
                description: 'Array of Character model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(Character, {includeRelations: true}),
                        },
                    },
                },
            },
        },
    })
    async find(
        @param.filter(Character) filter?: Filter<Character>,
    ): Promise<Character[]> {
        return this.characterRepository.find(filter);
    }

    @patch('/characters', {
        responses: {
            '200': {
                description: 'Character PATCH success count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Character, {partial: true}),
                },
            },
        })
            character: Character,
        @param.where(Character) where?: Where<Character>,
    ): Promise<Count> {
        return this.characterRepository.updateAll(character, where);
    }

    @get('/characters/{id}', {
        responses: {
            '200': {
                description: 'Character model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Character, {includeRelations: true}),
                    },
                },
            },
        },
    })
    async findById(
        @param.path.string('id') id: string
    ): Promise<(Weapon | Skill | Armor | string)[]> {
        const res: (Weapon | Skill | Armor | string)[] = ['no weapon', 'no armor', 'no skill'];

        const filter: Filter = {where: {"characterId": id}};
        if ((await this.weaponRepository.find(filter))[0] !== undefined) {
            res[0] = await this.characterRepository.weapon(id).get()
        }
        if ((await this.armorRepository.find(filter))[0] !== undefined) {
            res[1] = await this.characterRepository.armor(id).get()
        }
        if ((await this.skillRepository.find(filter))[0] !== undefined) {
            res[2] = await this.characterRepository.skill(id).get()
        }
        return res;
    }

    @patch('/characters/{id}', {
        responses: {
            '204': {
                description: 'Character PATCH success',
            },
        },
    })
    async updateById(
        @param.path.string('id') id: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Character, {partial: true}),
                },
            },
        })
            character: Character,
    ): Promise<void> {
        await this.characterRepository.updateById(id, character);
    }

    @put('/characters/{id}', {
        responses: {
            '204': {
                description: 'Character PUT success',
            },
        },
    })
    async replaceById(
        @param.path.string('id') id: string,
        @requestBody() character: Character,
    ): Promise<void> {
        await this.characterRepository.replaceById(id, character);
    }

    @del('/characters/{id}', {
        responses: {
            '204': {
                description: 'Character DELETE success',
            },
        },
    })
    async deleteById(@param.path.string('id') id: string): Promise<void> {
        //delete weapon, armor, and skill
        await this.characterRepository.weapon(id).delete();
        await this.characterRepository.armor(id).delete();
        await this.characterRepository.skill(id).delete();
        ///
        await this.characterRepository.deleteById(id);
    }

    @patch('/characters/{id}/weapon', {
        responses: {
            '200': {
                description: 'update weapon',
                content: {'application/json': {schema: Weapon}},
            },
        },
    })
    async updateWeapon(
        @param.path.string('id') id: string,
        @requestBody() weapon: Weapon,
    ): Promise<Weapon> {
        //equip new weapon
        const char: Character = await this.characterRepository.findById(id);
        char.attack! += weapon.attack;
        char.defence! += weapon.defence;

        //unequip old weapon
        const filter: Filter = {where: {"characterId": id}};
        if ((await this.weaponRepository.find(filter))[0] !== undefined) {
            const oldWeapon: Weapon = await this.characterRepository.weapon(id).get();
            char.attack! -= oldWeapon.attack;
            char.defence! -= oldWeapon.defence;
            await this.characterRepository.weapon(id).delete();
        }
        await this.characterRepository.updateById(id, char);
        return this.characterRepository.weapon(id).create(weapon);
    }

    @del('/characters/{id}/weapon', {
        responses: {
            '204': {
                description: 'DELETE Weapon',
            },
        },
    })
    async deleteWeapon(
        @param.path.string('id') id: string
    ): Promise<void> {
        //unequip old weapon
        const filter: Filter = {where: {"characterId": id}};
        if ((await this.weaponRepository.find(filter))[0] !== undefined) {
            const oldWeapon: Weapon = await this.characterRepository.weapon(id).get();
            const char: Character = await this.characterRepository.findById(id);
            char.attack! -= oldWeapon.attack!;
            char.defence! -= oldWeapon.defence!;
            await this.characterRepository.weapon(id).delete();
            await this.characterRepository.updateById(id, char);
        }
    }

    @patch('/characters/{id}/skill', {
        responses: {
            '200': {
                description: 'update skill',
                content: {'application/json': {schema: Skill}},
            },
        },
    })
    async updateSkill(
        @param.path.string('id') id: string,
        @requestBody() skill: Skill,
    ): Promise<Skill> {
        await this.characterRepository.skill(id).delete();
        return this.characterRepository.skill(id).create(skill);
    }

    @del('/characters/{id}/skill', {
        responses: {
            '204': {
                description: 'DELETE Skill',
            },
        },
    })
    async deleteSkill(
        @param.path.string('id') id: string
    ): Promise<void> {
        await this.characterRepository.skill(id).delete();
    }


    @patch('/characters/{id}/levelup', {
        responses: {
            '200': {
                description: 'level up',
                content: {'application/json': {schema: Character}},
            },
        },
    })
    async levelUp(@param.path.string('id') id: string): Promise<Character> {
        const char: Character = await this.characterRepository.findById(id);
        let levels = 0;
        while (char.currentExp! >= char.nextLevelExp!) {
            levels++;
            char.currentExp! -= char.nextLevelExp!;
            char.nextLevelExp! += 100;
        }
        char.level! += levels;
        char.maxHealth! += 10 * levels;
        char.currentHealth! = char.maxHealth!;
        char.maxMana! += 5 * levels;
        char.currentMana! = char.maxMana!;
        char.attack! += 3 * levels;
        char.defence! += levels;
        await this.characterRepository!.updateById(id, char);
        return char;
    }

    @post('/characters/login', {
        responses: {
            '200': {
                description: 'Token',
                content: {},
            },
        },
    })
    async login(
        @requestBody(CredentialsRequestBody) credential: Credential,
    ): Promise<{token: string}> {
        const token = await this.jwtService.getToken(credential);
        return {token};
    }

    @get('/characters/me', {
        responses: {
            '200': {
                description: 'The current user profile',
                content: {
                    'application/json': {
                        schema: UserProfileSchema,
                    },
                },
            },
        },
    })
    @authenticate('jwt', {"required": [PermissionKey.ViewOwnUser]})
    async printCurrentUser(
    ): Promise<MyUserProfile> {
        return this.getCurrentUser();
    }

}


